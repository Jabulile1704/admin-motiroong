"use client";

import { useMemo, useState } from "react";

import { CheckIcon, XIcon } from "@/components/icons";
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
  approveEmployee,
  fmtDay,
  rejectEmployee,
  roleLabel,
  setEmployeeRole,
  setEmployeeStatus,
  statusLabel,
  timeAgo,
  useEmployees,
  useSites,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from "@/lib/backend";
import { useAdmin } from "@/lib/session";

const pillVariant = (s: EmployeeStatus) =>
  s === "active" ? "filled" : s === "pending" ? "outlined" : "faded";

const selectCls =
  "h-10 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[14px] text-[13px] outline-none text-[var(--text)]";
const smallSelect =
  "h-[30px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-2 text-[12px] outline-none text-[var(--text)]";

type View = "pending" | "all";

export default function EmployeesPage() {
  const admin = useAdmin();
  const employees = useEmployees();
  const sites = useSites();

  const [view, setView] = useState<View>("pending");
  const [search, setSearch] = useState("");
  const [site, setSite] = useState("all");
  const [status, setStatus] = useState<EmployeeStatus | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(
    null,
  );

  const siteName = useMemo(
    () => new Map(sites.data.map((s) => [s.siteId, s.name])),
    [sites.data],
  );

  const pending = employees.data.filter((e) => e.status === "pending");

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return employees.data.filter(
      (e) =>
        (view === "pending" ? e.status === "pending" : status === "all" || e.status === status) &&
        (site === "all" || e.siteId === site) &&
        (e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.phone ?? "").includes(q) ||
          e.employeeId.toLowerCase().includes(q)),
    );
  }, [employees.data, view, status, site, search]);

  /** Runs a backend action for one employee and reports the outcome. */
  const act = async (e: Employee, done: string, action: () => Promise<unknown>) => {
    setBusy(e.uid);
    setNotice(null);
    try {
      await action();
      setNotice({ text: `${e.fullName}: ${done}.` });
    } catch (err) {
      setNotice({ text: (err as Error).message, error: true });
    } finally {
      setBusy(null);
    }
  };

  const approve = (e: Employee, role: EmployeeRole, siteId: string | null) =>
    act(e, "approved", () => approveEmployee({ uid: e.uid, role, siteId }));

  const reject = (e: Employee) => {
    const reason = window.prompt(
      `Reject ${e.fullName}'s sign-up?\n\nReason (required — shown to them in the app):`,
    );
    if (reason === null) return;
    if (!reason.trim()) {
      setNotice({ text: "A reason is needed to reject a sign-up.", error: true });
      return;
    }
    return act(e, "sign-up rejected", () =>
      rejectEmployee({ uid: e.uid, reason: reason.trim() }),
    );
  };

  const toggleSuspend = (e: Employee) => {
    if (e.status === "active") {
      const reason = window.prompt(
        `Suspend ${e.fullName}? They will be signed out of the app.\n\nReason (shown to them):`,
      );
      if (reason === null) return;
      return act(e, "suspended", () =>
        setEmployeeStatus({ uid: e.uid, status: "suspended", reason: reason.trim() || undefined }),
      );
    }
    return act(e, "reactivated", () => setEmployeeStatus({ uid: e.uid, status: "active" }));
  };

  const changeRole = (e: Employee, role: EmployeeRole) =>
    act(e, `role changed to ${roleLabel[role]}`, () => setEmployeeRole({ uid: e.uid, role }));

  return (
    <>
      <div className="flex items-baseline justify-between mb-[22px]">
        <div>
          <Eyebrow>Directory</Eyebrow>
          <PageTitle>Employees</PageTitle>
        </div>
        <div className="text-[12px] text-[var(--muted)] max-w-[320px] text-right">
          Employees join by signing up in the MoTiroong app. Their request
          appears here for approval.
        </div>
      </div>

      <div className="flex items-center gap-[10px] mb-[18px] flex-wrap">
        <FilterChip active={view === "pending"} onClick={() => setView("pending")} rounded="20px">
          Pending approval{pending.length ? ` · ${pending.length}` : ""}
        </FilterChip>
        <FilterChip active={view === "all"} onClick={() => setView("all")} rounded="20px">
          All employees
        </FilterChip>
        <div className="w-2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone or ID…"
          aria-label="Search employees"
          className={`${selectCls} flex-1 max-w-[280px] placeholder:text-[var(--muted)]`}
        />
        <select aria-label="Site" value={site} onChange={(e) => setSite(e.target.value)} className={selectCls}>
          <option value="all">All sites</option>
          {sites.data.map((s) => (
            <option key={s.siteId} value={s.siteId}>
              {s.name}
            </option>
          ))}
        </select>
        {view === "all" && (
          <select
            aria-label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeStatus | "all")}
            className={selectCls}
          >
            <option value="all">All statuses</option>
            {(Object.keys(statusLabel) as EmployeeStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        )}
      </div>

      {notice && <Notice error={notice.error}>{notice.text}</Notice>}
      {employees.error && <Notice error>{employees.error}</Notice>}

      <Card className="overflow-hidden">
        {view === "pending" ? (
          <PendingTable
            rows={rows}
            loading={employees.loading}
            sites={sites.data}
            busy={busy}
            canApprove={admin.role === "admin"}
            onApprove={approve}
            onReject={reject}
          />
        ) : (
          <AllTable
            rows={rows}
            loading={employees.loading}
            siteName={siteName}
            busy={busy}
            selfUid={admin.uid}
            canManage={admin.role === "admin"}
            onToggleSuspend={toggleSuspend}
            onChangeRole={changeRole}
          />
        )}
      </Card>
    </>
  );
}

function Header({ cols, children }: { cols: string; children: React.ReactNode }) {
  return (
    <div
      className={`grid ${cols} px-5 py-3 eyebrow text-[10px] tracking-[0.1em] border-b border-[var(--border)]`}
    >
      {children}
    </div>
  );
}

function Empty({ loading, text }: { loading: boolean; text: string }) {
  return (
    <div className="px-5 py-8 text-[13px] text-[var(--muted)]">
      {loading ? "Loading…" : text}
    </div>
  );
}

const pendingCols = "grid-cols-[2fr_1fr_1.1fr_1fr_1.3fr_1.6fr]";

function PendingTable(props: {
  rows: Employee[];
  loading: boolean;
  sites: { siteId: string; name: string }[];
  busy: string | null;
  canApprove: boolean;
  onApprove: (e: Employee, role: EmployeeRole, siteId: string | null) => void;
  onReject: (e: Employee) => void;
}) {
  return (
    <>
      <Header cols={pendingCols}>
        <div>Requested by</div>
        <div>ID</div>
        <div>Department</div>
        <div>Requested</div>
        <div>Approve as</div>
        <div>Decision</div>
      </Header>
      {props.rows.map((e, i) => (
        <PendingRow key={e.uid} e={e} last={i === props.rows.length - 1} {...props} />
      ))}
      {props.rows.length === 0 && (
        <Empty loading={props.loading} text="No sign-ups are waiting for approval." />
      )}
    </>
  );
}

function PendingRow({
  e,
  last,
  sites,
  busy,
  canApprove,
  onApprove,
  onReject,
}: {
  e: Employee;
  last: boolean;
  sites: { siteId: string; name: string }[];
  busy: string | null;
  canApprove: boolean;
  onApprove: (e: Employee, role: EmployeeRole, siteId: string | null) => void;
  onReject: (e: Employee) => void;
}) {
  const [role, setRole] = useState<EmployeeRole>("employee");
  const [siteId, setSiteId] = useState<string>(e.siteId ?? "");
  const working = busy === e.uid;

  return (
    <div
      className={`grid ${pendingCols} items-center px-5 py-[13px] text-[13px] ${
        last ? "" : "border-b border-[var(--border)]"
      }`}
    >
      <div className="flex items-center gap-[10px] min-w-0">
        <Avatar name={e.fullName} />
        <div className="min-w-0">
          <div className="truncate">{e.fullName}</div>
          <div className="text-[12px] text-[var(--muted)] truncate">
            {e.email}
            {e.phone && <> · {e.phone}</>}
          </div>
        </div>
      </div>
      <div className="text-[var(--muted)]">{e.employeeId || "—"}</div>
      <div className="text-[var(--muted)]">{e.department || "—"}</div>
      <div className="text-[var(--muted)]" title={fmtDay(e.createdAt)}>
        {timeAgo(e.createdAt)}
      </div>
      <div className="flex gap-[6px]">
        <select
          aria-label={`Role for ${e.fullName}`}
          value={role}
          onChange={(ev) => setRole(ev.target.value as EmployeeRole)}
          className={smallSelect}
        >
          {(Object.keys(roleLabel) as EmployeeRole[]).map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </select>
        <select
          aria-label={`Home site for ${e.fullName}`}
          value={siteId}
          onChange={(ev) => setSiteId(ev.target.value)}
          className={`${smallSelect} max-w-[120px]`}
        >
          <option value="">No site</option>
          {sites.map((s) => (
            <option key={s.siteId} value={s.siteId}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-[6px] items-center">
        <button
          onClick={() => onApprove(e, role, siteId || null)}
          disabled={working || !canApprove}
          title={canApprove ? undefined : "Only admins can approve sign-ups"}
          className="h-[30px] px-3 rounded-[8px] bg-[var(--invert-bg)] text-[var(--invert-text)] flex items-center gap-[6px] text-[12px] font-semibold cursor-pointer disabled:opacity-40"
        >
          <CheckIcon stroke="var(--invert-text)" />
          Approve
        </button>
        <button
          onClick={() => onReject(e)}
          disabled={working || !canApprove}
          aria-label={`Reject ${e.fullName}`}
          className="h-[30px] px-3 rounded-[8px] border border-[var(--border)] flex items-center gap-[6px] text-[12px] font-semibold cursor-pointer disabled:opacity-40"
        >
          <XIcon stroke="var(--text)" />
          Reject
        </button>
      </div>
    </div>
  );
}

const allCols = "grid-cols-[2fr_1fr_1.1fr_1.1fr_1fr_1.4fr]";

function AllTable(props: {
  rows: Employee[];
  loading: boolean;
  siteName: Map<string, string>;
  busy: string | null;
  selfUid: string;
  canManage: boolean;
  onToggleSuspend: (e: Employee) => void;
  onChangeRole: (e: Employee, role: EmployeeRole) => void;
}) {
  const { rows, siteName, busy, selfUid, canManage } = props;
  return (
    <>
      <Header cols={allCols}>
        <div>Employee</div>
        <div>ID</div>
        <div>Role</div>
        <div>Site</div>
        <div>Status</div>
        <div>Manage</div>
      </Header>
      {rows.map((e, i) => {
        const self = e.uid === selfUid;
        const manageable =
          canManage && !self && (e.status === "active" || e.status === "suspended");
        return (
          <div
            key={e.uid}
            className={`grid ${allCols} items-center px-5 py-[13px] text-[13px] ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex items-center gap-[10px] min-w-0">
              <Avatar name={e.fullName} inverted={e.status === "active"} />
              <div className="min-w-0">
                <div className="truncate">
                  {e.fullName}
                  {self && <span className="text-[var(--muted)]"> (you)</span>}
                </div>
                <div className="text-[12px] text-[var(--muted)] truncate">
            {e.email}
            {e.phone && <> · {e.phone}</>}
          </div>
              </div>
            </div>
            <div className="text-[var(--muted)]">{e.employeeId || "—"}</div>
            <div>
              {manageable ? (
                <select
                  aria-label={`Role for ${e.fullName}`}
                  value={e.role}
                  disabled={busy === e.uid}
                  onChange={(ev) => props.onChangeRole(e, ev.target.value as EmployeeRole)}
                  className={smallSelect}
                >
                  {(Object.keys(roleLabel) as EmployeeRole[]).map((r) => (
                    <option key={r} value={r}>
                      {roleLabel[r]}
                    </option>
                  ))}
                </select>
              ) : (
                roleLabel[e.role]
              )}
            </div>
            <div className="text-[var(--muted)]">
              {e.siteId ? siteName.get(e.siteId) ?? e.siteId : "—"}
            </div>
            <div title={e.statusReason ?? undefined}>
              <StatusPill variant={pillVariant(e.status)}>{statusLabel[e.status]}</StatusPill>
            </div>
            <div>
              {manageable && (
                <button
                  onClick={() => props.onToggleSuspend(e)}
                  disabled={busy === e.uid}
                  className="h-[30px] px-3 rounded-[8px] border border-[var(--border)] text-[12px] font-semibold cursor-pointer disabled:opacity-40"
                >
                  {e.status === "active" ? "Suspend" : "Reactivate"}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <Empty loading={props.loading} text="No employees match the current filters." />
      )}
    </>
  );
}
