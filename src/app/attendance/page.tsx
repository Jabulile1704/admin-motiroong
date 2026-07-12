"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  CalendarIcon,
  ChevronDown,
  DownloadIcon,
} from "@/components/icons";
import {
  Avatar,
  Card,
  Eyebrow,
  FilterChip,
  PageTitle,
  StatusPill,
} from "@/components/ui";
import {
  attendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/lib/data";

const statusFilters: AttendanceStatus[] = [
  "On time",
  "Late",
  "Absent",
  "Missing clock-out",
];

const pillVariant = (s: AttendanceStatus) =>
  s === "On time" ? "filled" : s === "Late" ? "outlined" : "faded";

const col = createColumnHelper<AttendanceRecord>();
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
    cell: (c) =>
      c.getValue() ?? <span className="text-[var(--muted2)]">{c.row.original.status === "Missing clock-out" ? "missing" : "—"}</span>,
  }),
  col.accessor("duration", {
    header: "Duration",
    cell: (c) => (
      <span className="text-[var(--muted)]">{c.getValue() ?? "—"}</span>
    ),
  }),
  col.accessor("status", {
    header: "Status",
    cell: (c) => (
      <StatusPill variant={pillVariant(c.getValue())}>{c.getValue()}</StatusPill>
    ),
  }),
];

function exportCsv(rows: AttendanceRecord[]) {
  const head = "Employee,Site,Date,Clock in,Clock out,Duration,Status";
  const body = rows
    .map((r) =>
      [r.employee, r.site, r.date, r.clockIn, r.clockOut ?? "", r.duration ?? "", r.status]
        .map((v) => `"${v}"`)
        .join(",")
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | null>("On time");

  const data = useMemo(
    () =>
      attendance.filter(
        (r) =>
          (!status || r.status === status) &&
          r.employee.toLowerCase().includes(search.toLowerCase())
      ),
    [search, status]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const gridCols = "grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_1fr]";

  return (
    <>
      <Eyebrow>Records</Eyebrow>
      <div className="mb-[22px]">
        <PageTitle>Attendance</PageTitle>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-[10px] mb-[18px] flex-wrap">
        <div className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex items-center px-[14px] text-[13px] text-[var(--muted)] gap-2">
          <CalendarIcon stroke="var(--muted)" />
          Jul 3 – Jul 9, 2026
        </div>
        <div className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex items-center px-[14px] text-[13px] gap-2">
          All sites <ChevronDown stroke="var(--muted)" />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee…"
          className="h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] flex-1 max-w-[260px] px-[14px] text-[13px] outline-none placeholder:text-[var(--muted)]"
        />
        <div className="flex gap-[6px] ml-1">
          {statusFilters.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              onClick={() => setStatus(status === s ? null : s)}
            >
              {s}
            </FilterChip>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => exportCsv(data)}
          className="h-10 px-[18px] rounded-[10px] bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-[13px] font-semibold cursor-pointer"
        >
          <DownloadIcon stroke="var(--text)" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {table.getHeaderGroups().map((hg) => (
          <div
            key={hg.id}
            className={`grid ${gridCols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
          >
            {hg.headers.map((h) => (
              <div key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </div>
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
              <div key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        {table.getRowModel().rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            No records match the current filters.
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-[12px] text-[var(--muted)]">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} records
        </div>
        <div className="flex gap-[6px]">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
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
            className="w-[30px] h-[30px] rounded-[8px] border border-[var(--border)] flex items-center justify-center disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
