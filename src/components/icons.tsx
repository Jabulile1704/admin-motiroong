/** Inline stroke icons ported from the handoff prototype's SVGs. */

type P = { size?: number; className?: string; stroke?: string };
const S = (p: P) => p.stroke ?? "currentColor";

export const SearchIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" className={p.className}>
    <circle cx="11" cy="11" r="6.5" stroke={S(p)} strokeWidth="1.8" />
    <path d="M20 20l-4.3-4.3" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const CalendarIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={S(p)} strokeWidth="1.8" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const ChevronDown = (p: P) => (
  <svg width="8" height="14" viewBox="0 0 8 14" className={p.className}>
    <path d="M1 4l3 4 3-4" stroke={S(p)} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" stroke={S(p)} strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="9.5" r="2.3" stroke={S(p)} strokeWidth="1.7" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <circle cx="12" cy="12" r="8.5" stroke={S(p)} strokeWidth="1.8" />
    <path d="M12 7.5V12l3.2 2" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ExceptionIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M12 4.5L21 19.5H3L12 4.5Z" stroke={S(p)} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.8" r="0.9" fill={S(p)} />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M5 13l4 4L19 7" stroke={S(p)} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const XIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M6 6l12 12M18 6L6 18" stroke={S(p)} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M12 5v14M5 12h14" stroke={S(p)} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M12 3v13M7 12l5 5 5-5M5 21h14" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg width={p.size ?? 15} height={p.size ?? 15} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M12 3.5v2M12 18.5v2M4.5 12h-2M21.5 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" stroke={S(p)} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="4" fill={S(p)} stroke={S(p)} />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg width={p.size ?? 15} height={p.size ?? 15} viewBox="0 0 24 24" fill="none" className={p.className}>
    <path d="M20 14.2A8.5 8.5 0 019.8 4a8.5 8.5 0 1010.2 10.2z" fill={S(p)} stroke={S(p)} />
  </svg>
);
