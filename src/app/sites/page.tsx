import { PinIcon, PlusIcon } from "@/components/icons";
import { Card, Eyebrow, PageTitle } from "@/components/ui";
import { sites } from "@/lib/data";

export default function SitesPage() {
  return (
    <>
      <div className="flex items-baseline justify-between mb-[22px]">
        <div>
          <Eyebrow>Locations</Eyebrow>
          <PageTitle>Sites</PageTitle>
        </div>
        <button className="h-[42px] px-5 rounded-[11px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
          <PlusIcon stroke="var(--invert-text)" />
          Add Site
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sites.map((s) => (
          <Card
            key={s.id}
            className={`p-[22px] ${s.active ? "" : "opacity-70"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-[12px] bg-[var(--surface-alt)] flex items-center justify-center">
                  <PinIcon stroke="var(--text)" />
                </span>
                <div>
                  <div className="text-[16px] font-semibold">{s.name}</div>
                  <div className="text-[12px] text-[var(--muted)] mt-[2px]">
                    {s.address}
                  </div>
                </div>
              </div>
              <span
                className={`eyebrow text-[10px] tracking-[0.06em] px-[9px] py-1 rounded-[20px] ${
                  s.active
                    ? "bg-[var(--invert-bg)] !text-[var(--invert-text)]"
                    : "border border-[var(--border)]"
                }`}
                style={s.active ? { color: "var(--invert-text)" } : undefined}
              >
                {s.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-[10px] mt-5 pt-[18px] border-t border-[var(--border)]">
              <div>
                <div className="eyebrow text-[9px] tracking-[0.1em]">Geofence</div>
                <div className="text-[15px] font-semibold mt-1">
                  {s.geofenceRadiusM} m
                </div>
              </div>
              <div>
                <div className="eyebrow text-[9px] tracking-[0.1em]">Employees</div>
                <div className="text-[15px] font-semibold mt-1">{s.employees}</div>
              </div>
              <div>
                <div className="eyebrow text-[9px] tracking-[0.1em]">
                  Avg check-in
                </div>
                <div className="text-[15px] font-semibold mt-1">
                  {s.avgCheckIn ?? "—"}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
