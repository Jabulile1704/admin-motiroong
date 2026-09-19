"use client";

/**
 * The signed-in admin, from Firebase Auth.
 *
 * Access is decided by the role and status in the user's ID-token claims —
 * the same values firestore.rules check — not by anything the browser can
 * edit. Only active admins and supervisors get past the gate; supervisors can
 * review, but the backend refuses them anything admin-only (approving
 * sign-ups, editing sites) with its own message.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { firebase } from "./firebase";
import type { EmployeeRole } from "./backend";

export type AdminSession = {
  uid: string;
  email: string;
  name: string;
  role: EmployeeRole;
};

type SessionState =
  | { kind: "loading" }
  | { kind: "signedOut" }
  /** Signed in, but not an active admin or supervisor. */
  | { kind: "denied"; email: string; reason: string }
  | { kind: "signedIn"; session: AdminSession };

const SessionContext = createContext<{
  state: SessionState;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}>({
  state: { kind: "loading" },
  signIn: async () => null,
  signOut: async () => {},
});

async function resolve(user: User): Promise<SessionState> {
  const token = await user.getIdTokenResult();
  const role = token.claims.role as EmployeeRole | undefined;
  const status = token.claims.status as string | undefined;
  const email = user.email ?? "";

  if (role !== "admin" && role !== "supervisor") {
    return {
      kind: "denied",
      email,
      reason:
        "This account is not an admin or supervisor. Ask an existing admin to change your role.",
    };
  }
  if (status !== "active") {
    return {
      kind: "denied",
      email,
      reason: "This account is not active.",
    };
  }

  let name = user.displayName || email;
  try {
    const snap = await getDoc(doc(firebase().db, "employees", user.uid));
    name = (snap.data()?.fullName as string) || name;
  } catch {
    // The name is cosmetic; the claims already decided access.
  }
  return { kind: "signedIn", session: { uid: user.uid, email, name, role } };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ kind: "loading" });

  useEffect(() => {
    const { auth } = firebase();
    // onIdTokenChanged (not onAuthStateChanged) so a role change picked up
    // on token refresh takes effect without signing out.
    return onIdTokenChanged(auth, async (user) => {
      setState(user ? await resolve(user) : { kind: "signedOut" });
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(firebase().auth, email.trim(), password);
      return null;
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        return "Incorrect email address or password.";
      }
      if (code === "auth/too-many-requests") {
        return "Too many attempts. Wait a few minutes and try again.";
      }
      if (code === "auth/network-request-failed") {
        return "Cannot reach MoTiroong. Is the backend running?";
      }
      return "Could not sign in. Please try again.";
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(firebase().auth);
  }, []);

  return (
    <SessionContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

/** The signed-in admin. Only valid inside the gate. */
export function useAdmin(): AdminSession {
  const { state } = useSession();
  if (state.kind !== "signedIn") {
    throw new Error("useAdmin() used outside the signed-in gate");
  }
  return state.session;
}
