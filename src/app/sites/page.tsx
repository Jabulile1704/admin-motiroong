"use client";

import { useMemo, useState } from "react";

import { PinIcon, PlusIcon } from "@/components/icons";
import { Card, Eyebrow, Notice, PageTitle } from "@/components/ui";
import {
  archiveSite,
  upsertSite,
  useAttendance,
  useEmployees,
  useNow,
  useSites,
  type Site,
} from "@/lib/backend";
import { useAdmin } from "@/lib/session";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

type Draft = {
  siteId?: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
};

const emptyDraft: Draft = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  radiusMeters: "150",
};

export default function SitesPage() {
  const admin = useAdmin();
  const sites = useSites();
  const employees = useEmployees();
  const attendance = useAttendance(1000);
  const now = useNow();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const canEdit = admin.role === "admin";

  const stats = useMemo(() => {
    const since = now - MONTH_MS;
    const bySite = new Map<string, { staff: number; inNow: number; minutes: number[] }>();
    const get = (id: string) => {
      if (!bySite.has(id)) bySite.set(id, { staff: 0, inNow: 0, minutes: [] });
      return bySite.get(id)!;
    };
    for (const e of employees.data) {
      if (e.siteId && e.status === "active") get(e.siteId).staff++;
    }
    for (const r of attendance.data) {
      if (!r.siteId || !r.clockInAt) continue;
      if (r.status === "open") get(r.siteId).inNow++;
      if (r.clockInAt.getTime() >= since) {
        get(r.siteId).minutes.push(r.clockInAt.getHours() * 60 + r.clockInAt.getMinutes());
      }
    }
    return bySite;
  }, [employees.data, attendance.data, now]);

  const avgCheckIn = (minutes: number[]) => {
    if (!minutes.length) return "—";
    const avg = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    const d = new Date();
    d.setHours(Math.floor(avg / 60), avg % 60, 0, 0);
    return new Intl.DateTimeFormat("en-ZA", { hour: "numeric", minute: "2-digit" }).format(d);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setNotice(null);
    try {
      await upsertSite({
        siteId: draft.siteId,
        name: draft.name.trim(),
        address: draft.address.trim() || null,
        latitude: Number(draft.latitude),
        longitude: Number(draft.longitude),
        radiusMeters: Number(draft.radiusMeters),
      });
      setNotice({ text: `${draft.name.trim()} saved.` });
      setDraft(null);
    } catch (err) {
      setNotice({ text: (err as Error).message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const archive = async (s: Site) => {
    if (!window.confirm(`Archive ${s.name}? Past attendance keeps its link to the site, but nobody can clock in against it.`)) {
      return;
    }
    setNotice(null);
    try {
      await archiveSite(s.siteId);
      setNotice({ text: `${s.name} archived.` });
    } catch (err) {
      setNotice({ text: (err as Error).message, error: true });
    }
  };

  const edit = (s: Site) =>
    setDraft({
      siteId: s.siteId,
      name: s.name,
      address: s.address ?? "",
      latitude: String(s.latitude),
      longitude: String(s.longitude),
      radiusMeters: String(s.radiusMeters),
    });

  return (
    <>
      <div className="flex items-baseline justify-between mb-[22px]">
        <div>
          <Eyebrow>Locations</Eyebrow>
          <PageTitle>Sites</PageTitle>
        </div>
        {canEdit && (
          <button
            onClick={() => setDraft(emptyDraft)}
            className="h-[42px] px-5 rounded-[11px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center gap-2 text-[13px] font-semibold cursor-pointer"
          >
            <PlusIcon stroke="var(--invert-text)" />
            Add Site
          </button>
        )}
      </div>

      {notice && <Notice error={notice.error}>{notice.text}</Notice>}
      {sites.error && <Notice error>{sites.error}</Notice>}

      {draft && (
        <SiteForm draft={draft} setDraft={setDraft} saving={saving} onSubmit={save} />
      )}

      <div className="grid grid-cols-2 gap-4">
        {sites.data.map((s) => {
          const st = stats.get(s.siteId);
          return (
            <Card key={s.siteId} className={`p-[22px] ${s.active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-[12px] bg-[var(--surface-alt)] flex items-center justify-center shrink-0">
                    <PinIcon stroke="var(--text)" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold truncate">{s.name}</div>
                    <div className="text-[12px] text-[var(--muted)] mt-[2px] truncate">
                      {s.address || `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`}
                    </div>
                  </div>
                </div>
                <span
                  className={`eyebrow text-[10px] tracking-[0.06em] px-[9px] py-1 rounded-[20px] shrink-0 ${
                    s.active ? "bg-[var(--invert-bg)]" : "border border-[var(--border)]"
                  }`}
                  style={s.active ? { color: "var(--invert-text)" } : undefined}
                >
                  {s.active ? "Active" : "Archived"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-[10px] mt-5 pt-[18px] border-t border-[var(--border)]">
                <Stat label="Geofence" value={`${s.radiusMeters} m`} />
                <Stat label="Employees" value={String(st?.staff ?? 0)} />
                <Stat label="In now" value={String(st?.inNow ?? 0)} />
                <Stat label="Avg check-in" value={avgCheckIn(st?.minutes ?? [])} />
              </div>
              {canEdit && s.active && (
                <div className="flex gap-3 mt-4 text-[12px] font-semibold">
                  <button onClick={() => edit(s)} className="cursor-pointer underline">
                    Edit
                  </button>
                  <button onClick={() => archive(s)} className="cursor-pointer text-[var(--muted)] underline">
                    Archive
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {!sites.loading && sites.data.length === 0 && !sites.error && (
        <Card className="p-8 text-[13px] text-[var(--muted)]">No sites yet.</Card>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow text-[9px] tracking-[0.1em]">{label}</div>
      <div className="text-[15px] font-semibold mt-1">{value}</div>
    </div>
  );
}

function SiteForm({
  draft,
  setDraft,
  saving,
  onSubmit,
}: {
  draft: Draft;
  setDraft: (d: Draft | null) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const field =
    "h-10 w-full bg-[var(--surface-alt)] rounded-[10px] px-3 text-[13px] outline-none text-[var(--text)]";
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft({ ...draft, [k]: e.target.value });

  return (
    <Card className="p-[22px] mb-4">
      <form onSubmit={onSubmit}>
        <div className="text-[15px] font-semibold mb-4">
          {draft.siteId ? `Edit ${draft.name}` : "New site"}
        </div>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-3">
          <Labelled id="site-name" label="Name">
            <input id="site-name" required value={draft.name} onChange={set("name")} className={field} />
          </Labelled>
          <Labelled id="site-address" label="Address">
            <input id="site-address" value={draft.address} onChange={set("address")} className={field} />
          </Labelled>
          <Labelled id="site-lat" label="Latitude">
            <input id="site-lat" required type="number" step="any" min={-90} max={90} value={draft.latitude} onChange={set("latitude")} className={field} />
          </Labelled>
          <Labelled id="site-lng" label="Longitude">
            <input id="site-lng" required type="number" step="any" min={-180} max={180} value={draft.longitude} onChange={set("longitude")} className={field} />
          </Labelled>
          <Labelled id="site-radius" label="Radius (m)">
            <input id="site-radius" required type="number" min={20} max={10000} value={draft.radiusMeters} onChange={set("radiusMeters")} className={field} />
          </Labelled>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-[10px] bg-[var(--invert-bg)] text-[var(--invert-text)] text-[13px] font-semibold cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save site"}
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="h-10 px-5 rounded-[10px] border border-[var(--border)] text-[13px] font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

function Labelled({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
