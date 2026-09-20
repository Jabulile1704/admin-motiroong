"use client";

/**
 * The dashboard's connection to the MoTiroong backend — the same Firebase
 * project (Auth, Firestore, callable Functions) the mobile app uses.
 *
 * Reads go straight to Firestore: firestore.rules let admins and supervisors
 * read employees, attendance and exceptions, and admins read the audit log.
 * Every change goes through a callable (approveEmployee, reviewException,
 * upsertSite…), never a direct write — the rules deny all client writes, and
 * the functions are what enforce roles and write the audit trail.
 *
 * With NEXT_PUBLIC_USE_EMULATORS=true it talks to the local Emulator Suite
 * instead (see the Motirong-firebase repo's start.sh).
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

/** Must match `Config.region` in motiroong-backend. */
export const REGION = "africa-south1";

const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
const emulatorHost = process.env.NEXT_PUBLIC_EMULATOR_HOST || "127.0.0.1";

/**
 * Origin of a self-hosted backend, e.g. https://motiroong.onrender.com.
 *
 * Cloud Functions only runs on the Blaze plan, so the same `onCall` handlers
 * can be served from any Node host instead (`functions/src/server.ts` in
 * motiroong-backend). getFunctions() takes such an origin in place of a
 * region and then posts the identical callable protocol to
 * `<origin>/<name>`, so nothing downstream of here changes.
 *
 * Auth and Firestore still talk to the real project, which is free on Spark.
 */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "");

const config = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "motirong-32a1c",
  // The emulators accept any key; the deployed project needs the web app's.
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    (useEmulators ? "emulator-api-key" : ""),
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "motirong-32a1c.firebaseapp.com",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let services: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
} | null = null;

/** Lazily initialised so nothing touches Firebase during server rendering. */
export function firebase() {
  if (services) return services;

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  // A custom origin replaces the region: with one, the SDK posts to
  // <origin>/<name>; with the other, to the deployed Cloud Functions URL.
  const functions = getFunctions(app, backendUrl || REGION);

  if (useEmulators) {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, emulatorHost, 8080);
    connectFunctionsEmulator(functions, emulatorHost, 5001);
  }

  services = { app, auth, db, functions };
  return services;
}

export const usingEmulators = useEmulators;
export const backendOrigin = backendUrl ?? null;
