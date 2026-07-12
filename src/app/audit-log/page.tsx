import { CalendarIcon, ChevronDown } from "@/components/icons";
import { Card, Eyebrow, PageTitle } from "@/components/ui";
import { audit } from "@/lib/data";

const cols = "grid-cols-[1.2fr_1.4fr_2fr_1.4fr]";

export default function AuditLogPage() {
  return (
    <>
      <Eyebrow>System</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Audit Log</PageTitle>
      </div>

      <div className="flex items-center gap-[10px] mb-[18px]">
        <div className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex items-center px-[14px] text-[13px] text-[var(--muted)] gap-2">
          <CalendarIcon stroke="var(--muted)" />
          Last 30 days
        </div>
        <div className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex items-center px-[14px] text-[13px] gap-2">
          All actions <ChevronDown stroke="var(--muted)" />
        </div>
        <div className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex items-center px-[14px] text-[13px] gap-2">
          All admins <ChevronDown stroke="var(--muted)" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div
          className={`grid ${cols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
        >
          <div>Timestamp</div>
          <div>Actor</div>
          <div>Action</div>
          <div>Target</div>
        </div>
        {audit.map((e, i) => (
          <div
            key={e.id}
            className={`grid ${cols} items-center px-5 py-[13px] text-[13px] ${
              i < audit.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="eyebrow text-[12px] normal-case">{e.timestamp}</div>
            <div>{e.actor}</div>
            <div>{e.action}</div>
            <div className="text-[var(--muted)]">{e.target}</div>
          </div>
        ))}
      </Card>
    </>
  );
}
