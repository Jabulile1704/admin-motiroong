"use client";

import { useMemo, useState } from "react";

import { Card, Eyebrow, Notice, PageTitle } from "@/components/ui";
import {
  describeAction,
  fmtDateTime,
  useAuditLog,
  useEmployees,
  useNow,
  useSites,
} from "@/lib/backend";

const cols = "grid-cols-[1.2fr_1.4fr_1.6fr_1.4fr]";
const ranges = [
  { label: "Last 24 hours", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "All time", days: 0 },
];

export default function AuditLogPage() {
  const log = useAuditLog(500);
  const employees = useEmployees();
  const sites = useSites();
  const now = useNow();
  const [days, setDays] = useState(30);
  const [action, setAction] = useState("all");
  const [actor, setActor] = useState("all");

  const names = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of employees.data) m.set(e.uid, e.fullName);
    for (const s of sites.data) m.set(s.siteId, s.name);
    return m;
  }, [employees.data, sites.data]);

  const actorName = (uid: string, email: string | null) =>
    uid === "system" ? "System" : names.get(uid) ?? email ?? uid;

  const actions = useMemo(
    () => [...new Set(log.data.map((e) => e.action))].sort(),
    [log.data],
  );
  const actors = useMemo(
    () => [...new Set(log.data.map((e) => e.actorUid))],
    [log.data],
  );

  const rows = log.data.filter(
    (e) =>
      (days === 0 || (e.at?.getTime() ?? 0) >= now - days * 86_400_000) &&
      (action === "all" || e.action === action) &&
      (actor === "all" || e.actorUid === actor),
  );

  const control =
    "h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[14px] text-[13px] outline-none text-[var(--text)]";

  return (
    <>
      <Eyebrow>System</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Audit Log</PageTitle>
      </div>

      <div className="flex items-center gap-[10px] mb-[18px]">
        <select aria-label="Date range" value={days} onChange={(e) => setDays(Number(e.target.value))} className={control}>
          {ranges.map((r) => (
            <option key={r.days} value={r.days}>
              {r.label}
            </option>
          ))}
        </select>
        <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className={control}>
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {describeAction(a)}
            </option>
          ))}
        </select>
        <select aria-label="Actor" value={actor} onChange={(e) => setActor(e.target.value)} className={control}>
          <option value="all">Everyone</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {actorName(a, null)}
            </option>
          ))}
        </select>
      </div>

      {log.error && <Notice error>{log.error}</Notice>}

      <Card className="overflow-hidden">
        <div
          className={`grid ${cols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
        >
          <div>Timestamp</div>
          <div>Actor</div>
          <div>Action</div>
          <div>Target</div>
        </div>
        {rows.map((e, i) => (
          <div
            key={e.id}
            className={`grid ${cols} items-center px-5 py-[13px] text-[13px] ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="eyebrow text-[12px] normal-case">{fmtDateTime(e.at)}</div>
            <div>{actorName(e.actorUid, e.actorEmail)}</div>
            <div>{describeAction(e.action)}</div>
            <div className="text-[var(--muted)] truncate">
              {e.targetId ? names.get(e.targetId) ?? e.targetId : "—"}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            {log.loading ? "Loading…" : "Nothing logged in this range."}
          </div>
        )}
      </Card>
    </>
  );
}
