import Link from "next/link";

import { CheckIcon, ClockIcon, ExceptionIcon } from "@/components/icons";
import { Card, CardLabel, Eyebrow, PageTitle } from "@/components/ui";
import { bySite, weeklyHours } from "@/lib/data";

const activity = [
  { icon: ClockIcon, text: <><b>TT Mapeshoane</b> clocked in at Bloemfontein</>, when: "2 min ago" },
  { icon: ExceptionIcon, text: <><b>Lionel van der Merwe</b> submitted a Late exception</>, when: "18 min ago" },
  { icon: CheckIcon, text: <><b>Jabulile Mashibini</b> approved an Early Leave request for <b>Oscar Poco</b></>, when: "1 hr ago" },
  { icon: ClockIcon, text: <><b>TT Mapeshoane</b> clocked out at Potchefstroom</>, when: "2 hr ago" },
];

export default function DashboardPage() {
  return (
    <>
      <Eyebrow>Overview</Eyebrow>
      <div className="flex items-baseline justify-between mb-[26px]">
        <PageTitle>Dashboard</PageTitle>
        <div className="eyebrow text-[12px] normal-case">
          Tuesday, Jul 9 · 2:14 PM
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-[6px] mb-[14px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--text)]" />
            <CardLabel>Clocked in now</CardLabel>
          </div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">86</div>
          <div className="text-[12px] text-[var(--muted)] mt-[2px]">
            of 128 employees
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-[14px]"><CardLabel>On time today</CardLabel></div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">79</div>
          <div className="text-[12px] text-[var(--muted)] mt-[2px]">
            92% of clock-ins
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-[14px]"><CardLabel>Late today</CardLabel></div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">7</div>
          <div className="text-[12px] text-[var(--muted)] mt-[2px]">
            avg 14 min late
          </div>
        </Card>
        {/* Highlighted: pending exceptions */}
        <div className="rounded-[20px] p-5 bg-[var(--invert-bg)] text-[var(--invert-text)]">
          <div className="eyebrow text-[10px] tracking-[0.12em] opacity-60 !text-[inherit] mb-[14px]" style={{ color: "inherit" }}>
            Pending exceptions
          </div>
          <div className="text-[32px] font-semibold tracking-[-0.02em]">5</div>
          <Link
            href="/exceptions"
            className="inline-block text-[12px] mt-[6px] opacity-85 underline"
          >
            Review queue →
          </Link>
        </div>
      </div>

      {/* Chart + by-site */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-4 mb-6">
        <Card className="p-[22px]">
          <div className="flex items-baseline justify-between mb-[18px]">
            <CardLabel>Hours logged</CardLabel>
            <div className="text-[13px] font-semibold text-[var(--muted)]">
              Last 7 days
            </div>
          </div>
          <div className="flex gap-[14px] items-end h-[150px]">
            {weeklyHours.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-full max-w-[34px] rounded-[6px] ${
                    d.logged ? "bg-[var(--text)]" : "bg-[var(--surface-alt)]"
                  }`}
                  style={{ height: d.h }}
                />
                <div className="text-[11px] text-[var(--muted)]">{d.day}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-[22px]">
          <div className="mb-4"><CardLabel>By site</CardLabel></div>
          <div className="flex flex-col gap-[14px]">
            {bySite.map((s) => (
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
                    style={{ width: `${Math.round((s.inNow / s.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-[22px]">
        <div className="mb-[14px]"><CardLabel>Recent activity</CardLabel></div>
        <div className="flex flex-col">
          {activity.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-[11px] ${
                i < activity.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <span className="w-[30px] h-[30px] rounded-[8px] bg-[var(--surface-alt)] flex items-center justify-center shrink-0">
                <a.icon stroke="var(--text)" />
              </span>
              <div className="flex-1 text-[13px]">{a.text}</div>
              <div className="eyebrow text-[11px] normal-case">{a.when}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
