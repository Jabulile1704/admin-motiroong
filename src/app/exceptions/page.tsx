"use client";

import { useMemo, useState } from "react";

import { CheckIcon, XIcon } from "@/components/icons";
import {
  Avatar,
  Card,
  CardLabel,
  Eyebrow,
  FilterChip,
  PageTitle,
  StatusPill,
} from "@/components/ui";
import {
  exceptionsSeed,
  type ExceptionRequest,
  type ExceptionStatus,
} from "@/lib/data";

const gridCols = "grid-cols-[1.6fr_1fr_1fr_2fr_1fr_1.4fr]";

export default function ExceptionsPage() {
  const [requests, setRequests] = useState<ExceptionRequest[]>(exceptionsSeed);
  const [filter, setFilter] = useState<ExceptionStatus>("Pending");

  const counts = useMemo(
    () => ({
      Pending: requests.filter((r) => r.status === "Pending").length,
      Approved: requests.filter((r) => r.status === "Approved").length,
      Denied: requests.filter((r) => r.status === "Denied").length,
    }),
    [requests]
  );

  const rows = requests.filter((r) => r.status === filter);

  const decide = (id: string, status: ExceptionStatus) =>
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <>
      <Eyebrow>Requests</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Exceptions</PageTitle>
      </div>

      {/* Stat cards — Pending inverted per the handoff */}
      <div className="grid grid-cols-3 gap-4 mb-[22px]">
        <div className="rounded-[20px] p-5 bg-[var(--invert-bg)] text-[var(--invert-text)]">
          <div
            className="eyebrow text-[10px] tracking-[0.12em] opacity-60 mb-3"
            style={{ color: "inherit" }}
          >
            Pending
          </div>
          <div className="text-[30px] font-semibold">{counts.Pending}</div>
        </div>
        <Card className="p-5">
          <div className="mb-3"><CardLabel>Approved this week</CardLabel></div>
          <div className="text-[30px] font-semibold">{7 + counts.Approved}</div>
        </Card>
        <Card className="p-5">
          <div className="mb-3"><CardLabel>Denied this week</CardLabel></div>
          <div className="text-[30px] font-semibold">{2 + counts.Denied}</div>
        </Card>
      </div>

      {/* Filter pills */}
      <div className="flex gap-[6px] mb-4">
        {(["Pending", "Approved", "Denied"] as ExceptionStatus[]).map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            rounded="20px"
          >
            {s}
          </FilterChip>
        ))}
        <FilterChip active={false} rounded="20px">
          All types
        </FilterChip>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div
          className={`grid ${gridCols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
        >
          <div>Employee</div>
          <div>Type</div>
          <div>Date</div>
          <div>Reason</div>
          <div>Submitted</div>
          <div>{filter === "Pending" ? "Action" : "Status"}</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`grid ${gridCols} items-center px-5 py-[14px] text-[13px] ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex items-center gap-[10px]">
              <Avatar name={r.employee} />
              {r.employee}
            </div>
            <div>
              <StatusPill variant="outlined">{r.type}</StatusPill>
            </div>
            <div className="text-[var(--muted)]">{r.date}</div>
            <div className="text-[var(--muted)]">{r.reason}</div>
            <div className="text-[var(--muted)]">{r.submitted}</div>
            {r.status === "Pending" ? (
              <div className="flex gap-[6px]">
                <button
                  onClick={() => decide(r.id, "Approved")}
                  aria-label={`Approve ${r.employee}`}
                  className="w-[30px] h-[30px] rounded-[8px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center justify-center cursor-pointer"
                >
                  <CheckIcon stroke="var(--invert-text)" />
                </button>
                <button
                  onClick={() => decide(r.id, "Denied")}
                  aria-label={`Deny ${r.employee}`}
                  className="w-[30px] h-[30px] rounded-[8px] border border-[var(--border)] flex items-center justify-center cursor-pointer"
                >
                  <XIcon stroke="var(--text)" />
                </button>
              </div>
            ) : (
              <div>
                <StatusPill variant={r.status === "Approved" ? "filled" : "faded"}>
                  {r.status}
                </StatusPill>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            No {filter.toLowerCase()} requests.
          </div>
        )}
      </Card>
    </>
  );
}
