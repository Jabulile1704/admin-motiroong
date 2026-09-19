"use client";

import { useMemo, useState } from "react";

import { CheckIcon, XIcon } from "@/components/icons";
import {
  Avatar,
  Card,
  CardLabel,
  Eyebrow,
  FilterChip,
  Notice,
  PageTitle,
  StatusPill,
} from "@/components/ui";
import {
  exceptionTypeLabel,
  fmtCalendarDay,
  fmtDay,
  reviewException,
  timeAgo,
  useEmployees,
  useExceptions,
  useNow,
  type ExceptionRequest,
  type ExceptionStatus,
} from "@/lib/backend";
import { useAdmin } from "@/lib/session";

const gridCols = "grid-cols-[1.6fr_1.1fr_0.9fr_2fr_1fr_1.4fr]";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const statusName: Record<ExceptionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Denied",
};

export default function ExceptionsPage() {
  const admin = useAdmin();
  const exceptions = useExceptions();
  const now = useNow();
  const employees = useEmployees();
  const [filter, setFilter] = useState<ExceptionStatus>("pending");
  const [type, setType] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const nameOf = useMemo(
    () => new Map(employees.data.map((e) => [e.uid, e.fullName])),
    [employees.data],
  );

  const counts = useMemo(() => {
    const since = now - WEEK_MS;
    const recent = (r: ExceptionRequest) => (r.reviewedAt?.getTime() ?? 0) >= since;
    return {
      pending: exceptions.data.filter((r) => r.status === "pending").length,
      approved: exceptions.data.filter((r) => r.status === "approved" && recent(r)).length,
      rejected: exceptions.data.filter((r) => r.status === "rejected" && recent(r)).length,
    };
  }, [exceptions.data, now]);

  const types = useMemo(
    () => [...new Set(exceptions.data.map((r) => r.type))],
    [exceptions.data],
  );

  const rows = exceptions.data.filter(
    (r) => r.status === filter && (type === "all" || r.type === type),
  );

  const decide = async (r: ExceptionRequest, decision: "approved" | "rejected") => {
    const who = nameOf.get(r.uid) ?? r.employeeId;
    const notes = window.prompt(
      `${decision === "approved" ? "Approve" : "Deny"} ${who}'s request?\n\nOptional note for the record:`,
    );
    if (notes === null) return;
    setBusy(r.exceptionId);
    setNotice(null);
    try {
      await reviewException({
        exceptionId: r.exceptionId,
        decision,
        notes: notes.trim() || undefined,
      });
      setNotice({ text: `${who}: request ${decision === "approved" ? "approved" : "denied"}.` });
    } catch (e) {
      setNotice({ text: (e as Error).message, error: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Eyebrow>Requests</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Exceptions</PageTitle>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-[22px]">
        <div className="rounded-[20px] p-5 bg-[var(--invert-bg)] text-[var(--invert-text)]">
          <div
            className="eyebrow text-[10px] tracking-[0.12em] opacity-60 mb-3"
            style={{ color: "inherit" }}
          >
            Pending
          </div>
          <div className="text-[30px] font-semibold">{counts.pending}</div>
        </div>
        <Card className="p-5">
          <div className="mb-3"><CardLabel>Approved this week</CardLabel></div>
          <div className="text-[30px] font-semibold">{counts.approved}</div>
        </Card>
        <Card className="p-5">
          <div className="mb-3"><CardLabel>Denied this week</CardLabel></div>
          <div className="text-[30px] font-semibold">{counts.rejected}</div>
        </Card>
      </div>

      <div className="flex gap-[6px] mb-4 flex-wrap">
        {(Object.keys(statusName) as ExceptionStatus[]).map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} rounded="20px">
            {statusName[s]}
          </FilterChip>
        ))}
        <div className="w-3" />
        <FilterChip active={type === "all"} onClick={() => setType("all")} rounded="20px">
          All types
        </FilterChip>
        {types.map((t) => (
          <FilterChip key={t} active={type === t} onClick={() => setType(t)} rounded="20px">
            {exceptionTypeLabel(t)}
          </FilterChip>
        ))}
      </div>

      {notice && <Notice error={notice.error}>{notice.text}</Notice>}
      {exceptions.error && <Notice error>{exceptions.error}</Notice>}

      <Card className="overflow-hidden">
        <div
          className={`grid ${gridCols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
        >
          <div>Employee</div>
          <div>Type</div>
          <div>For date</div>
          <div>Reason</div>
          <div>{filter === "pending" ? "Waiting" : "Reviewed"}</div>
          <div>{filter === "pending" ? "Action" : "Status"}</div>
        </div>
        {rows.map((r, i) => {
          const who = nameOf.get(r.uid) ?? r.employeeId;
          const own = r.uid === admin.uid;
          return (
            <div
              key={r.exceptionId}
              className={`grid ${gridCols} items-center px-5 py-[14px] text-[13px] ${
                i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <div className="flex items-center gap-[10px]">
                <Avatar name={who} />
                {who}
              </div>
              <div>
                <StatusPill variant="outlined">{exceptionTypeLabel(r.type)}</StatusPill>
              </div>
              <div className="text-[var(--muted)]" title={`Submitted ${fmtDay(r.submittedAt)}`}>
                {fmtCalendarDay(r.forDate) ?? fmtDay(r.submittedAt)}
              </div>
              <div className="text-[var(--muted)] pr-4">
                {r.reason}
                {r.reviewNotes && (
                  <div className="text-[12px] mt-1">Note: {r.reviewNotes}</div>
                )}
              </div>
              <div className="text-[var(--muted)]">
                {timeAgo(r.status === "pending" ? r.submittedAt : r.reviewedAt)}
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-[6px]">
                  <button
                    onClick={() => decide(r, "approved")}
                    disabled={busy === r.exceptionId || own}
                    title={own ? "You cannot review your own request" : undefined}
                    aria-label={`Approve ${who}`}
                    className="w-[30px] h-[30px] rounded-[8px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    <CheckIcon stroke="var(--invert-text)" />
                  </button>
                  <button
                    onClick={() => decide(r, "rejected")}
                    disabled={busy === r.exceptionId || own}
                    title={own ? "You cannot review your own request" : undefined}
                    aria-label={`Deny ${who}`}
                    className="w-[30px] h-[30px] rounded-[8px] border border-[var(--border)] flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    <XIcon stroke="var(--text)" />
                  </button>
                </div>
              ) : (
                <div>
                  <StatusPill variant={r.status === "approved" ? "filled" : "faded"}>
                    {statusName[r.status]}
                  </StatusPill>
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            {exceptions.loading ? "Loading…" : `No ${statusName[filter].toLowerCase()} requests.`}
          </div>
        )}
      </Card>
    </>
  );
}
