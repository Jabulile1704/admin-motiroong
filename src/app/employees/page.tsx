"use client";

import { useMemo, useState } from "react";

import { PlusIcon } from "@/components/icons";
import {
  Avatar,
  Card,
  Eyebrow,
  PageTitle,
  StatusPill,
} from "@/components/ui";
import { employees, sites, type EmployeeStatus } from "@/lib/data";

const pillVariant = (s: EmployeeStatus) =>
  s === "Active" ? "filled" : s === "Invited" ? "outlined" : "faded";

const gridCols = "grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_1.2fr]";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [site, setSite] = useState("All sites");
  const [role, setRole] = useState("All roles");

  const roles = useMemo(
    () => ["All roles", ...new Set(employees.map((e) => e.role))],
    []
  );
  const siteNames = useMemo(
    () => ["All sites", ...sites.map((s) => s.name)],
    []
  );

  const rows = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) &&
          (site === "All sites" || e.site === site) &&
          (role === "All roles" || e.role === role)
      ),
    [search, site, role]
  );

  const selectCls =
    "h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[14px] text-[13px] outline-none text-[var(--text)]";

  return (
    <>
      <div className="flex items-baseline justify-between mb-[22px]">
        <div>
          <Eyebrow>Directory</Eyebrow>
          <PageTitle>Employees</PageTitle>
        </div>
        <button className="h-[42px] px-5 rounded-[11px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
          <PlusIcon stroke="var(--invert-text)" />
          Add Employee
        </button>
      </div>

      <div className="flex items-center gap-[10px] mb-[18px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees…"
          className={`${selectCls} flex-1 max-w-[280px] placeholder:text-[var(--muted)]`}
        />
        <select value={site} onChange={(e) => setSite(e.target.value)} className={selectCls}>
          {siteNames.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div
          className={`grid ${gridCols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
        >
          <div>Employee</div>
          <div>ID</div>
          <div>Role</div>
          <div>Site</div>
          <div>Status</div>
          <div>Last active</div>
        </div>
        {rows.map((e, i) => (
          <div
            key={e.id}
            className={`grid ${gridCols} items-center px-5 py-[13px] text-[13px] ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex items-center gap-[10px]">
              <Avatar name={e.name} inverted={e.status === "Active"} />
              {e.name}
            </div>
            <div className="text-[var(--muted)]">{e.employeeId}</div>
            <div>{e.role}</div>
            <div className="text-[var(--muted)]">{e.site}</div>
            <div>
              <StatusPill variant={pillVariant(e.status)}>{e.status}</StatusPill>
            </div>
            <div className="text-[var(--muted)]">{e.lastActive ?? "—"}</div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
            No employees match the current filters.
          </div>
        )}
      </Card>
    </>
  );
}
