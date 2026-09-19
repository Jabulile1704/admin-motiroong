"use client";

import { useState } from "react";

import { usingEmulators } from "@/lib/firebase";
import { useSession } from "@/lib/session";
import { TopNav } from "./TopNav";
import { Card, Mark } from "./ui";

/**
 * Everything behind a sign-in. Signed-out visitors get the login card;
 * signed-in users who are not active admins or supervisors get told why and
 * offered a sign-out.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { state, signOut } = useSession();

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-[13px] text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (state.kind === "signedOut") return <SignIn />;

  if (state.kind === "denied") {
    return (
      <Centered>
        <h1 className="text-[22px] font-semibold">No admin access</h1>
        <p className="text-[13px] text-[var(--muted)] mt-2 leading-[1.5]">
          Signed in as <b className="text-[var(--text)]">{state.email}</b>.{" "}
          {state.reason}
        </p>
        <button
          onClick={signOut}
          className="mt-6 h-[42px] w-full rounded-[11px] bg-[var(--invert-bg)] text-[var(--invert-text)] text-[13px] font-semibold cursor-pointer"
        >
          Sign out
        </button>
      </Centered>
    );
  }

  return (
    <>
      <TopNav />
      <main className="max-w-[1440px] mx-auto px-8 pt-8 pb-20">{children}</main>
    </>
  );
}

function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  };

  const field =
    "h-11 w-full bg-[var(--surface-alt)] rounded-[10px] px-[14px] text-[14px] outline-none text-[var(--text)] placeholder:text-[var(--muted)]";

  return (
    <Centered>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <h1 className="text-[22px] font-semibold">Admin sign in</h1>
        <p className="text-[13px] text-[var(--muted)] -mt-1 mb-2">
          Use your MoTiroong admin or supervisor account.
        </p>
        <label className="text-[12px] font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <label className="text-[12px] font-semibold mt-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
        {error && (
          <p role="alert" className="text-[13px] font-semibold">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 h-[44px] rounded-[11px] bg-[var(--invert-bg)] text-[var(--invert-text)] text-[14px] font-semibold cursor-pointer disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {usingEmulators && (
          <p className="eyebrow text-[10px] tracking-[0.1em] text-center mt-2">
            Local backend (emulators)
          </p>
        )}
      </form>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-[9px] justify-center mb-6">
          <Mark />
          <span className="text-[16px] font-semibold tracking-[-0.01em]">
            MoTiroong
          </span>
          <span className="eyebrow text-[10px] tracking-[0.12em] bg-[var(--surface-alt)] px-2 py-[3px] rounded-[20px]">
            Admin
          </span>
        </div>
        <Card className="p-7">{children}</Card>
      </div>
    </div>
  );
}
