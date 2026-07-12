import { initials } from "@/lib/data";

/** Space Mono uppercase eyebrow above a page title. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow text-[11px] tracking-[0.18em]">{children}</div>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[28px] font-semibold tracking-[-0.01em] mt-[6px]">
      {children}
    </h1>
  );
}

/** Standard surface card: 20px radius, token border. */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-[20px] ${className}`}
    >
      {children}
    </div>
  );
}

/** Small Space Mono section label inside cards. */
export function CardLabel({
  children,
  invert = false,
}: {
  children: React.ReactNode;
  invert?: boolean;
}) {
  return (
    <div
      className={`eyebrow text-[10px] tracking-[0.14em] ${invert ? "opacity-60 !text-[inherit]" : ""}`}
      style={invert ? { color: "inherit" } : undefined}
    >
      {children}
    </div>
  );
}

/** Status language per the design system: fill / outline / faded. */
export function StatusPill({
  children,
  variant = "filled",
}: {
  children: React.ReactNode;
  variant?: "filled" | "outlined" | "faded";
}) {
  const styles = {
    filled: "bg-[var(--invert-bg)] text-[var(--invert-text)]",
    outlined: "border border-[var(--text)] text-[var(--text)]",
    faded: "bg-[var(--surface-alt)] text-[var(--muted2)]",
  }[variant];
  return (
    <span
      className={`inline-flex px-[10px] py-[4px] rounded-[20px] text-[11px] font-semibold whitespace-nowrap ${styles}`}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  inverted = false,
  size = 28,
}: {
  name: string;
  inverted?: boolean;
  size?: number;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${
        inverted
          ? "bg-[var(--invert-bg)] text-[var(--invert-text)]"
          : "bg-[var(--surface-alt)]"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.39 }}
    >
      {initials(name)}
    </span>
  );
}

/** Filter chip: solid when active, outlined otherwise. */
export function FilterChip({
  active,
  onClick,
  children,
  rounded = "10px",
}: {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  rounded?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-[40px] px-[14px] text-[12px] font-semibold cursor-pointer transition-colors ${
        active
          ? "bg-[var(--invert-bg)] text-[var(--invert-text)]"
          : "border border-[var(--border)] text-[var(--muted)]"
      }`}
      style={{ borderRadius: rounded }}
    >
      {children}
    </button>
  );
}

/** The MoTiroong mark, rendered with the exact clip-path polygon. */
export function Mark({ size = 22 }: { size?: number }) {
  const dot = size * 0.36;
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 bg-[var(--text)]"
        style={{
          clipPath:
            "polygon(0% 100%,0% 0%,20% 0%,50% 42%,80% 0%,100% 0%,100% 100%,79% 100%,79% 38%,55% 74%,45% 74%,21% 38%,21% 100%)",
        }}
      />
      <span
        className="absolute rounded-full bg-[var(--surface)] border-[1.6px] border-[var(--text)]"
        style={{ top: -2, right: -2, width: dot, height: dot }}
      />
    </span>
  );
}
