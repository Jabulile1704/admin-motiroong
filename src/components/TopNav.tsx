"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { roleLabel } from "@/lib/backend";
import { useAdmin, useSession } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { Avatar, Mark } from "./ui";
import { MoonIcon, SearchIcon, SunIcon } from "./icons";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/attendance", label: "Attendance" },
  { href: "/sites", label: "Sites" },
  { href: "/employees", label: "Employees" },
  { href: "/exceptions", label: "Exceptions" },
  { href: "/audit-log", label: "Audit Log" },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const admin = useAdmin();
  const { signOut } = useSession();

  return (
    <div className="sticky top-0 z-50 h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-2 px-7">
      <div className="flex items-center gap-[9px] mr-5">
        <Mark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          MoTiroong
        </span>
        <span className="eyebrow text-[10px] tracking-[0.12em] bg-[var(--surface-alt)] px-2 py-[3px] rounded-[20px]">
          Admin
        </span>
      </div>

      <nav className="flex items-center h-full gap-1">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center h-full px-[14px] text-[13px] border-b-2 ${
                active
                  ? "font-semibold text-[var(--text)] border-[var(--text)]"
                  : "font-medium text-[var(--muted)] border-transparent"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-[14px]">
        <button
          className="w-9 h-9 rounded-[10px] bg-[var(--surface-alt)] flex items-center justify-center cursor-pointer"
          aria-label="Search"
        >
          <SearchIcon stroke="var(--muted)" />
        </button>

        <button
          onClick={toggle}
          className="flex items-center gap-[7px] pl-[10px] pr-3 py-[6px] rounded-[20px] bg-[var(--surface-alt)] cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon stroke="var(--text)" />
          ) : (
            <MoonIcon stroke="var(--text)" />
          )}
          <span className="eyebrow !text-[var(--text)] text-[11px] font-semibold tracking-[0.04em] normal-case">
            {theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>

        <div className="flex items-center gap-[9px] pl-[14px] border-l border-[var(--border)]">
          <Avatar name={admin.name} inverted size={32} />
          <div>
            <div className="text-[13px] font-semibold leading-[1.2]">
              {admin.name}
            </div>
            <div className="eyebrow text-[10px] leading-[1.2] normal-case">
              {roleLabel[admin.role]}
            </div>
          </div>
          <button
            onClick={signOut}
            className="ml-2 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
