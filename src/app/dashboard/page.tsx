"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CheckIcon, ClockIcon, ExceptionIcon } from "@/components/icons";
import { Card, CardLabel, Eyebrow, Notice, PageTitle } from "@/components/ui";
import {
  describeAction,
  timeAgo,
  useAttendance,
  useAuditLog,
  useEmployees,
  useExceptions,
  useSites,
} from "@/lib/backend";

const DAY_MS = 86_400_000;
const dayName = new Intl.DateTimeFormat("en-ZA", { weekday: "short" });
const headerFmt = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function DashboardPage() {
  const employees = useEmployees();
  const sites = useSites();
  const attendance = useAttendance(1000);
  const exceptions = useExceptions();
  const audit = useAuditLog(8);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const m = useMemo(() => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const active = employees.data.filter((e) => e.status === "active");
    const open = attendance.data.filter((r) => r.status === "open");
    const todays = attendance.data.filter(
      (r) => (r.clockInAt?.getTime() ?? 0) >= today.getTime(),
    );

    // Hours worked per day for the last 7 days, open shifts counted to now.
    const week = Array.from({ length: 7 }, (_, i) => {
      const start = new Date(today.getTime() - (6 - i) * DAY_MS);
      return { start, label: dayName.format(start), minutes: 0 };
    });
    for (const r of attendance.data) {
      if (!r.clockInAt) continue;
      const idx = Math.floor((r.clockInAt.getTime() - week[0].start.getTime()) / DAY_MS);
      if (idx < 0 || idx > 6) continue;
      week[idx].minutes +=
        r.durationMinutes ??
        (r.status === "open" ? Math.round((now.getTime() - r.clockInAt.getTime()) / 60000) : 0);
    }
    const peak = Math.max(60, ...week.map((d) => d.minutes));

    const bySite = sites.data
      .filter((s) => s.active)
      .map((s) => ({
        name: s.name,
        inNow: open.filter((r) => r.siteId === s.siteId).length,
        total: active.filter((e) => e.siteId === s.siteId).length,
      }));

    return {
      activeCount: active.length,
      inNow: open.length,
      clockInsToday: todays.length,
      flaggedToday: todays.filter((r) => r.flags.length > 0).length,
      pendingApprovals: employees.data.filter((e) => e.status === "pending").length,
      pendingExceptions: exceptions.data.filter((x) => x.status === "pending").length,
      week,
      peak,
      bySite,
    };
  }, [employees.data, sites.data, attendance.data, exceptions.data, now]);

  const names = useMemo(
    () => new Map([
      ...employees.data.map((e) => [e.uid, e.fullName] as const),
      ...sites.data.map((s) => [s.siteId, s.name] as const),
    ]),
    [employees.data, sites.data],
  );

  const iconFor = (action: string) =>
    action.startsWith("exception")
      ? ExceptionIcon
      : action.includes("approved")
        ? CheckIcon
        : ClockIcon;

  const error = employees.error || attendance.error;

  return (
    <>
      <Eyebrow>Overview</Eyebrow>
      <div className="flex items-baseline justify-between mb-[26px]">
        <PageTitle>Dashboard</PageTitle>
        <div className="eyebrow text-[12px] normal-case">{headerFmt.format(now)}</div>
      </div>

      {error && <Notice error>{error}</Notice>}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-[6px] mb-[14px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--text)]" />
            <CardLabel>Clocked in now</CardLabel>
          </div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">{m.inNow}</div>
          <div className="text-[12px] text-[var(--muted)] mt-[2px]">
            of {m.activeCount} active employee{m.activeCount === 1 ? "" : "s"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-[14px]"><CardLabel>Clock-ins today</CardLabel></div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">{m.clockInsToday}</div>
          <div className="text-[12px] text-[var(--muted)] mt-[2px]">since midnight</div>
        </Card>
        <Card className="p-5">
          <div className="mb-[14px]"><CardLabel>Flagged today</CardLabel></div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">{m.flaggedToday}</div>
          <Link href="/attendance" className="inline-block text-[12px] text-[var(--muted)] mt-[2px] underline">
            See attendance →
          </Link>
        </Card>
        <div className="rounded-[20px] p-5 bg-[var(--invert-bg)] text-[var(--invert-text)]">
          <div
            className="eyebrow text-[10px] tracking-[0.12em] opacity-60 mb-[14px]"
            style={{ color: "inherit" }}
          >
            Waiting for you
          </div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">
            {m.pendingApprovals + m.pendingExceptions}
          </div>
          <div className="flex flex-col text-[12px] mt-[6px] opacity-85">
            <Link href="/employees" className="underline">
              {m.pendingApprovals} sign-up{m.pendingApprovals === 1 ? "" : "s"} to approve →
            </Link>
            <Link href="/exceptions" className="underline">
              {m.pendingExceptions} exception{m.pendingExceptions === 1 ? "" : "s"} to review →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.7fr_1fr] gap-4 mb-6">
        <Card className="p-[22px]">
          <div className="flex items-baseline justify-between mb-[18px]">
            <CardLabel>Hours logged</CardLabel>
            <div className="text-[13px] font-semibold text-[var(--muted)]">Last 7 days</div>
          </div>
          <div className="flex gap-[14px] items-end h-[150px]">
            {m.week.map((d, i) => (
              <div key={d.label + i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <div className="text-[10px] text-[var(--muted)]">
                  {d.minutes ? `${(d.minutes / 60).toFixed(1)}h` : ""}
                </div>
                <div
                  className={`w-full max-w-[34px] rounded-[6px] ${
                    i === 6 ? "bg-[var(--text)]" : d.minutes ? "bg-[var(--muted)]" : "bg-[var(--surface-alt)]"
                  }`}
                  style={{ height: Math.max(4, Math.round((d.minutes / m.peak) * 110)) }}
                  title={`${d.label}: ${(d.minutes / 60).toFixed(1)} hours`}
                />
                <div className="text-[11px] text-[var(--muted)]">{d.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-[22px]">
          <div className="mb-4"><CardLabel>In now, by site</CardLabel></div>
          <div className="flex flex-col gap-[14px]">
            {m.bySite.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-[13px] mb-[6px]">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-[var(--muted)]">
                    {s.inNow} / {s.total}
                  </div>
                </div>
                <div className="h-[6px] bg-[var(--surface-alt)] rounded-[4px]">
                  <div
                    className="h-full bg-[var(--text)] rounded-[4px]"
                    style={{ width: `${s.total ? Math.min(100, Math.round((s.inNow / s.total) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {m.bySite.length === 0 && (
              <div className="text-[13px] text-[var(--muted)]">No active sites.</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-[22px]">
        <div className="mb-[14px]"><CardLabel>Recent activity</CardLabel></div>
        {audit.error ? (
          <div className="text-[13px] text-[var(--muted)]">Only admins can see the activity feed.</div>
        ) : (
          <div className="flex flex-col">
            {audit.data.map((a, i) => {
              const Icon = iconFor(a.action);
              const actor = a.actorUid === "system" ? "System" : names.get(a.actorUid) ?? a.actorEmail ?? "Someone";
              const target = a.targetId && a.targetId !== a.actorUid ? names.get(a.targetId) : undefined;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 py-[11px] ${
                    i < audit.data.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <span className="w-[30px] h-[30px] rounded-[8px] bg-[var(--surface-alt)] flex items-center justify-center shrink-0">
                    <Icon stroke="var(--text)" />
                  </span>
                  <div className="flex-1 text-[13px]">
                    <b>{actor}</b> — {describeAction(a.action).toLowerCase()}
                    {target && <> · <b>{target}</b></>}
                  </div>
                  <div className="eyebrow text-[11px] normal-case">{timeAgo(a.at, now.getTime())}</div>
                </div>
              );
            })}
            {!audit.loading && audit.data.length === 0 && (
              <div className="text-[13px] text-[var(--muted)]">Nothing yet.</div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
