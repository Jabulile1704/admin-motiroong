"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DownloadIcon } from "@/components/icons";
import {
  Avatar,
  Card,
  Eyebrow,
  FilterChip,
  Notice,
  PageTitle,
  StatusPill,
} from "@/components/ui";
import {
  flagLabel,
  fmtDay,
  fmtDuration,
  fmtTime,
  useAttendance,
  useEmployees,
  useNow,
  useSites,
  type AttendanceRecord,
} from "@/lib/backend";

/**
 * The backend records shifts, not schedules, so there is no "late" or
 * "absent" to compute. What it does record: whether the shift is still open,
 * and any flags the server raised (outside the geofence, poor GPS, password
 * rather than Face ID/PIN, auto-closed after 16h…).
 */
type RowStatus = "On shift" | "Completed" | "Flagged";

type Row = {
  id: string;
  employee: string;
  site: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: string;
  status: RowStatus;
  flags: string[];
  record: AttendanceRecord;
};

const statusFilters: RowStatus[] = ["On shift", "Completed", "Flagged"];
const ranges = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "All time", days: 0 },
];

const pillVariant = (s: RowStatus) =>
  s === "On shift" ? "filled" : s === "Flagged" ? "outlined" : "faded";

const col = createColumnHelper<Row>();
const columns = [
  col.accessor("employee", {
    header: "Employee",
    cell: (c) => (
      <span className="flex items-center gap-[10px]">
        <Avatar name={c.getValue()} />
        {c.getValue()}
      </span>
    ),
  }),
  col.accessor("site", {
    header: "Site",
    cell: (c) => <span className="text-[var(--muted)]">{c.getValue()}</span>,
  }),
  col.accessor("date", {
    header: "Date",
    cell: (c) => <span className="text-[var(--muted)]">{c.getValue()}</span>,
  }),
  col.accessor("clockIn", { header: "Clock in" }),
  col.accessor("clockOut", {
    header: "Clock out",
    cell: (c) => c.getValue() ?? <span className="text-[var(--muted2)]">—</span>,
  }),
  col.accessor("duration", {
    header: "Duration",
    cell: (c) => <span className="text-[var(--muted)]">{c.getValue()}</span>,
  }),
  col.accessor("status", {
    header: "Status",
    cell: (c) => (
      <span title={c.row.original.flags.join(", ") || undefined}>
        <StatusPill variant={pillVariant(c.getValue())}>{c.getValue()}</StatusPill>
        {c.row.original.flags.length > 0 && (
          <span className="block text-[11px] text-[var(--muted)] mt-1">
            {c.row.original.flags.join(" · ")}
          </span>
        )}
      </span>
    ),
  }),
];

function exportCsv(rows: Row[]) {
  const head = "Employee,Employee ID,Site,Date,Clock in,Clock out,Duration,Status,Flags";
  const body = rows
    .map((r) =>
      [
        r.employee,
        r.record.employeeId,
        r.site,
        r.date,
        r.clockIn,
        r.clockOut ?? "",
        r.duration,
        r.status,
        r.flags.join("; "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${head}\n${body}`], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "motirong-attendance.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AttendancePage() {
  const attendance = useAttendance(1000);
  const employees = useEmployees();
  const sites = useSites();
  const now = useNow();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RowStatus | null>(null);
  const [site, setSite] = useState("all");
  const [days, setDays] = useState(7);

  const all: Row[] = useMemo(() => {
    const names = new Map(employees.data.map((e) => [e.uid, e.fullName]));
    const siteNames = new Map(sites.data.map((s) => [s.siteId, s.name]));
    return attendance.data.map((r) => {
      const minutes =
        r.durationMinutes ??
        (r.status === "open" && r.clockInAt
          ? Math.round((now - r.clockInAt.getTime()) / 60000)
          : null);
      return {
        id: r.recordId,
        employee: names.get(r.uid) ?? r.employeeId,
        site: r.siteId ? siteNames.get(r.siteId) ?? r.siteId : "No site",
        date: fmtDay(r.clockInAt),
        clockIn: fmtTime(r.clockInAt),
        clockOut: r.clockOutAt ? fmtTime(r.clockOutAt) : null,
        duration: fmtDuration(minutes),
        status: r.status === "open" ? "On shift" : r.flags.length ? "Flagged" : "Completed",
        flags: r.flags.map((f) => flagLabel[f] ?? f),
        record: r,
      };
    });
  }, [attendance.data, employees.data, sites.data, now]);

  const data = useMemo(() => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (days > 1) start.setDate(start.getDate() - (days - 1));
    const q = search.toLowerCase();
    return all.filter(
      (r) =>
        (days === 0 || (r.record.clockInAt?.getTime() ?? 0) >= start.getTime()) &&
        (!status ||
          r.status === status ||
          (status === "Flagged" && r.record.flags.length > 0)) &&
        (site === "all" || r.record.siteId === site) &&
        r.employee.toLowerCase().includes(q),
    );
  }, [all, days, status, site, search, now]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const gridCols = "grid-cols-[2fr_1.2fr_0.8fr_0.9fr_0.9fr_0.9fr_1.5fr]";
  const control =
    "h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[14px] text-[13px] outline-none text-[var(--text)]";

  return (
    <>
      <Eyebrow>Records</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Attendance</PageTitle>
      </div>

      <div className="flex items-center gap-[10px] mb-[18px] flex-wrap">
        <select
          aria-label="Date range"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className={control}
        >
          {ranges.map((r) => (
            <option key={r.days} value={r.days}>
              {r.label}
            </option>
          ))}
        </select>
        <select aria-label="Site" value={site} onChange={(e) => setSite(e.target.value)} className={control}>
          <option value="all">All sites</option>
          {sites.data.map((s) => (
            <option key={s.siteId} value={s.siteId}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee…"
          aria-label="Search employee"
          className={`${control} flex-1 max-w-[260px] placeholder:text-[var(--muted)]`}
        />
        <div className="flex gap-[6px] ml-1">
          {statusFilters.map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(status === s ? null : s)}>
              {s}
            </FilterChip>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => exportCsv(data)}
          disabled={data.length === 0}
          className="h-10 px-[18px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-[13px] font-semibold cursor-pointer disabled:opacity-40"
        >
          <DownloadIcon stroke="var(--text)" />
          Export CSV
        </button>
      </div>

      {attendance.error && <Notice error>{attendance.error}</Notice>}

      <Card className="overflow-hidden">
        {table.getHeaderGroups().map((hg) => (
          <div
            key={hg.id}
            className={`grid ${gridCols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
          >
            {hg.headers.map((h) => (
              <div key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</div>
            ))}
          </div>
        ))}
        {table.getRowModel().rows.map((row, i, rows) => (
          <div
            key={row.id}
            className={`grid ${gridCols} items-center px-5 py-[13px] text-[13px] ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            {row.getVisibleCells().map((cell) => (
              <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
            ))}
          </div>
        ))}
        {table.getRowModel().rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            {attendance.loading ? "Loading…" : "No records match the current filters."}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between mt-4 text-[12px] text-[var(--muted)]">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} records
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex gap-[6px]">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="w-[30px] h-[30px] rounded-[8px] border border-[var(--border)] flex items-center justify-center disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: table.getPageCount() }, (_, p) => (
              <button
                key={p}
                onClick={() => table.setPageIndex(p)}
                className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center ${
                  table.getState().pagination.pageIndex === p
                    ? "bg-[var(--invert-bg)] text-[var(--invert-text)] font-semibold"
                    : "border border-[var(--border)]"
                }`}
              >
                {p + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="w-[30px] h-[30px] rounded-[8px] border border-[var(--border)] flex items-center justify-center disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}
