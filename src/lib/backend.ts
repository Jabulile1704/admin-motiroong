"use client";

/**
 * Typed access to the MoTiroong backend.
 *
 * Document shapes mirror `functions/src/types.ts` in motiroong-backend; if a
 * field is renamed there, rename it here too. Reads are live Firestore
 * subscriptions, so an approval made on another admin's screen — or a
 * clock-in from the app — shows up without a refresh.
 */
import { useEffect, useState } from "react";
import {
  collection,
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { firebase } from "./firebase";

// ------------------------------------------------------------------- types

export type EmployeeStatus = "pending" | "active" | "suspended" | "rejected";
export type EmployeeRole = "employee" | "supervisor" | "admin";

export type Employee = {
  uid: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: EmployeeRole;
  status: EmployeeStatus;
  siteId: string | null;
  department: string | null;
  createdAt: Date | null;
  reviewedAt: Date | null;
  statusReason: string | null;
};

export type Site = {
  siteId: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  active: boolean;
};

export type AttendanceFlag =
  | "outside_geofence"
  | "low_gps_accuracy"
  | "clock_skew"
  | "late_sync"
  | "no_biometric"
  | "auto_closed";

export type AttendanceRecord = {
  recordId: string;
  uid: string;
  employeeId: string;
  siteId: string | null;
  status: "open" | "closed";
  clockInAt: Date | null;
  clockOutAt: Date | null;
  clockInDistanceMeters: number | null;
  durationMinutes: number | null;
  clockInBiometric: boolean;
  flags: AttendanceFlag[];
};

export type ExceptionStatus = "pending" | "approved" | "rejected";

export type ExceptionRequest = {
  exceptionId: string;
  uid: string;
  employeeId: string;
  attendanceId: string | null;
  type: string;
  reason: string;
  status: ExceptionStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
};

export type AuditEntry = {
  id: string;
  action: string;
  actorUid: string;
  actorEmail: string | null;
  targetId: string | null;
  at: Date | null;
  metadata: Record<string, unknown>;
};

// ------------------------------------------------------------ conversions

const date = (v: unknown): Date | null =>
  v instanceof Timestamp ? v.toDate() : null;

type Raw = Record<string, unknown>;

const toEmployee = (id: string, d: Raw): Employee => ({
  uid: (d.uid as string) ?? id,
  employeeId: (d.employeeId as string) ?? "",
  fullName: (d.fullName as string) ?? "(no name)",
  email: (d.email as string) ?? "",
  phone: (d.phone as string) ?? null,
  role: (d.role as EmployeeRole) ?? "employee",
  status: (d.status as EmployeeStatus) ?? "pending",
  siteId: (d.siteId as string) ?? null,
  department: (d.department as string) ?? null,
  createdAt: date(d.createdAt),
  reviewedAt: date(d.reviewedAt),
  statusReason: (d.statusReason as string) ?? null,
});

const toSite = (id: string, d: Raw): Site => ({
  siteId: (d.siteId as string) ?? id,
  name: (d.name as string) ?? id,
  address: (d.address as string) ?? null,
  latitude: Number(d.latitude ?? 0),
  longitude: Number(d.longitude ?? 0),
  radiusMeters: Number(d.radiusMeters ?? 150),
  active: d.active !== false,
});

const toAttendance = (id: string, d: Raw): AttendanceRecord => ({
  recordId: (d.recordId as string) ?? id,
  uid: d.uid as string,
  employeeId: (d.employeeId as string) ?? "",
  siteId: (d.siteId as string) ?? null,
  status: d.status === "closed" ? "closed" : "open",
  clockInAt: date(d.clockInAt),
  clockOutAt: date(d.clockOutAt),
  clockInDistanceMeters: (d.clockInDistanceMeters as number) ?? null,
  durationMinutes: (d.durationMinutes as number) ?? null,
  clockInBiometric: d.clockInBiometric === true,
  flags: Array.isArray(d.flags) ? (d.flags as AttendanceFlag[]) : [],
});

const toException = (id: string, d: Raw): ExceptionRequest => ({
  exceptionId: (d.exceptionId as string) ?? id,
  uid: d.uid as string,
  employeeId: (d.employeeId as string) ?? "",
  attendanceId: (d.attendanceId as string) ?? null,
  type: (d.type as string) ?? "other",
  reason: (d.reason as string) ?? "",
  status: (d.status as ExceptionStatus) ?? "pending",
  submittedAt: date(d.submittedAt),
  reviewedAt: date(d.reviewedAt),
  reviewNotes: (d.reviewNotes as string) ?? null,
});

const toAudit = (id: string, d: Raw): AuditEntry => ({
  id,
  action: (d.action as string) ?? "",
  actorUid: (d.actorUid as string) ?? "",
  actorEmail: (d.actorEmail as string) ?? null,
  targetId: (d.targetId as string) ?? null,
  at: date(d.at),
  metadata: (d.metadata as Record<string, unknown>) ?? {},
});

// ------------------------------------------------------------- live reads

export type Live<T> = { data: T[]; loading: boolean; error: string | null };

function useLiveCollection<T>(
  path: string,
  convert: (id: string, d: Raw) => T,
  constraints: QueryConstraint[] = [],
  key = "",
): Live<T> {
  const [state, setState] = useState<Live<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const { db } = firebase();
    return onSnapshot(
      query(collection(db, path), ...constraints),
      (snap) =>
        setState({
          data: snap.docs.map((d) => convert(d.id, d.data())),
          loading: false,
          error: null,
        }),
      (err) =>
        setState({
          data: [],
          loading: false,
          error:
            err.code === "permission-denied"
              ? "Your account is not allowed to read this. Sign out and back in after being made an admin."
              : err.message,
        }),
    );
    // `constraints` is rebuilt every render; `key` carries its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);

  return state;
}

export const useEmployees = () =>
  useLiveCollection("employees", toEmployee, [orderBy("createdAt", "desc")]);

export const useSites = () =>
  useLiveCollection("sites", toSite, [orderBy("name")]);

export const useAttendance = (max = 500) =>
  useLiveCollection(
    "attendance",
    toAttendance,
    [orderBy("clockInAt", "desc"), limitTo(max)],
    String(max),
  );

export const useExceptions = () =>
  useLiveCollection("exceptions", toException, [orderBy("submittedAt", "desc")]);

export const useAuditLog = (max = 200) =>
  useLiveCollection(
    "auditLogs",
    toAudit,
    [orderBy("at", "desc"), limitTo(max)],
    String(max),
  );

// --------------------------------------------------------------- actions

/**
 * Calls a backend function and returns its result. Errors carry the
 * backend's own message (written for people), so pages can show it as is.
 */
async function call<T = unknown>(name: string, data: object): Promise<T> {
  const { functions } = firebase();
  try {
    const result = await httpsCallable(functions, name)(data);
    return result.data as T;
  } catch (e) {
    // The web SDK appends the HTTP status ("… [400]"); the backend's own text
    // is already written for people, so show it without the suffix.
    const message = ((e as { message?: string }).message ?? "")
      .replace(/\s*\[\d{3}\]$/, "")
      .trim();
    throw new Error(
      message && message !== "internal"
        ? message
        : "Something went wrong. Please try again.",
    );
  }
}

export const approveEmployee = (args: {
  uid: string;
  role?: EmployeeRole;
  siteId?: string | null;
  employeeId?: string;
}) => call("approveEmployee", args);

export const rejectEmployee = (args: { uid: string; reason: string }) =>
  call("rejectEmployee", args);

export const setEmployeeStatus = (args: {
  uid: string;
  status: "active" | "suspended";
  reason?: string;
}) => call("setEmployeeStatus", args);

export const setEmployeeRole = (args: { uid: string; role: EmployeeRole }) =>
  call("setEmployeeRole", args);

export const upsertSite = (args: {
  siteId?: string;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}) => call<{ siteId: string }>("upsertSite", args);

export const archiveSite = (siteId: string) => call("archiveSite", { siteId });

export const reviewException = (args: {
  exceptionId: string;
  decision: "approved" | "rejected";
  notes?: string;
}) => call("reviewException", args);

// --------------------------------------------------------------- helpers

/** The current time, refreshed every [intervalMs] — for "in the last N days". */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i, a) => (i === 0 || i === a.length - 1 ? p[0] : ""))
    .join("")
    .toUpperCase();

const dayFmt = new Intl.DateTimeFormat("en-ZA", { month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-ZA", { hour: "numeric", minute: "2-digit" });

export const fmtDay = (d: Date | null) => (d ? dayFmt.format(d) : "—");
export const fmtTime = (d: Date | null) => (d ? timeFmt.format(d) : "—");
export const fmtDateTime = (d: Date | null) =>
  d ? `${dayFmt.format(d)}, ${timeFmt.format(d)}` : "—";

export function fmtDuration(minutes: number | null) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function timeAgo(d: Date | null, now = Date.now()) {
  if (!d) return "—";
  const s = Math.round((now - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export const statusLabel: Record<EmployeeStatus, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const roleLabel: Record<EmployeeRole, string> = {
  employee: "Employee",
  supervisor: "Supervisor",
  admin: "Admin",
};

export const flagLabel: Record<AttendanceFlag, string> = {
  outside_geofence: "Outside geofence",
  low_gps_accuracy: "Low GPS accuracy",
  clock_skew: "Clock skew",
  late_sync: "Late sync",
  no_biometric: "No biometric",
  auto_closed: "Auto-closed",
};

export const exceptionTypeLabel = (t: string) =>
  ({
    missed_clock_in: "Missed clock-in",
    outside_geofence: "Outside geofence",
    device_failure: "Device failure",
    other: "Other",
  })[t] ?? t.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** "employee.approved" → "Approved employee" etc., for the audit log. */
export function describeAction(action: string) {
  const known: Record<string, string> = {
    "employee.signup": "Signed up",
    "employee.approved": "Approved employee",
    "employee.rejected": "Rejected sign-up",
    "employee.suspended": "Suspended employee",
    "employee.active": "Reactivated employee",
    "employee.role_changed": "Changed role",
    "device.enrolled": "Set up quick sign-in",
    "device.reenrolled": "Re-enrolled device",
    "device.revoked": "Removed device",
    "device.signin": "Signed in with device",
    "device.signin_failed": "Failed device sign-in",
    "site.created": "Created site",
    "site.updated": "Updated site",
    "site.archived": "Archived site",
    "exception.submitted": "Submitted exception",
    "exception.approved": "Approved exception",
    "exception.rejected": "Rejected exception",
    "attendance.clock_in": "Clocked in",
    "attendance.clock_out": "Clocked out",
    "attendance.auto_closed": "Shift auto-closed",
  };
  return known[action] ?? action.replace(/[._]/g, " ");
}
