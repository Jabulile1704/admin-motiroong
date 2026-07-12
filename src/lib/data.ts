/**
 * Demo data mirroring the handoff prototype. Replace with fetches
 * against the shared backend (the same API the Flutter app uses).
 *
 * NOTE: Site keeps lat/lng/radius — the exact fields the mobile app's
 * login geofence check reads. Keep this schema shared between clients.
 */

export type Site = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  geofenceRadiusM: number;
  employees: number;
  avgCheckIn: string | null;
  active: boolean;
};

export type AttendanceStatus =
  | "On time"
  | "Late"
  | "Absent"
  | "Early leave"
  | "Missing clock-out";

export type AttendanceRecord = {
  id: string;
  employee: string;
  site: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
  status: AttendanceStatus;
};

export type EmployeeStatus = "Active" | "Invited" | "Suspended";

export type Employee = {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  site: string;
  status: EmployeeStatus;
  lastActive: string | null;
};

export type ExceptionStatus = "Pending" | "Approved" | "Denied";

export type ExceptionRequest = {
  id: string;
  employee: string;
  type: "Late" | "Early Leave" | "Absence";
  date: string;
  reason: string;
  submitted: string;
  status: ExceptionStatus;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i, a) => (i === 0 || i === a.length - 1 ? p[0] : ""))
    .join("")
    .toUpperCase();

export const sites: Site[] = [
  { id: "s1", name: "Bloemfontein", address: "12 Kellner St, Westdene", lat: -29.1082, lng: 26.1927, geofenceRadiusM: 150, employees: 40, avgCheckIn: "8:58 AM", active: true },
  { id: "s2", name: "Potchefstroom", address: "45 Chris Hani Rd, Bailliepark", lat: -26.7167, lng: 27.1, geofenceRadiusM: 200, employees: 35, avgCheckIn: "9:04 AM", active: true },
  { id: "s3", name: "Johannesburg", address: "8 Empire Rd, Parktown", lat: -26.181, lng: 28.0402, geofenceRadiusM: 300, employees: 28, avgCheckIn: "9:11 AM", active: true },
  { id: "s4", name: "Cape Town", address: "3 Bree St, City Bowl", lat: -33.9184, lng: 18.4187, geofenceRadiusM: 250, employees: 25, avgCheckIn: null, active: false },
];

export const attendance: AttendanceRecord[] = [
  { id: "a1", employee: "TT Mapeshoane", site: "Bloemfontein", date: "Jul 9", clockIn: "9:02 AM", clockOut: null, duration: "3h 42m", status: "On time" },
  { id: "a2", employee: "Lionel van der Merwe", site: "Potchefstroom", date: "Jul 9", clockIn: "9:41 AM", clockOut: null, duration: "3h 03m", status: "Late" },
  { id: "a3", employee: "Oscar Poco", site: "Johannesburg", date: "Jul 8", clockIn: "8:58 AM", clockOut: "3:10 PM", duration: "6h 12m", status: "Early leave" },
  { id: "a4", employee: "TT Mapeshoane", site: "Potchefstroom", date: "Jul 8", clockIn: "9:00 AM", clockOut: "5:04 PM", duration: "8h 04m", status: "On time" },
  { id: "a5", employee: "Jabulile Mashibini", site: "Bloemfontein", date: "Jul 7", clockIn: "9:00 AM", clockOut: null, duration: null, status: "Missing clock-out" },
  { id: "a6", employee: "Oscar Poco", site: "Johannesburg", date: "Jul 7", clockIn: "9:03 AM", clockOut: "5:00 PM", duration: "7h 57m", status: "On time" },
  { id: "a7", employee: "Jabulile Mashibini", site: "Bloemfontein", date: "Jul 6", clockIn: "8:55 AM", clockOut: "5:02 PM", duration: "8h 07m", status: "On time" },
  { id: "a8", employee: "Lionel van der Merwe", site: "Potchefstroom", date: "Jul 6", clockIn: "—", clockOut: null, duration: null, status: "Absent" },
];

export const employees: Employee[] = [
  { id: "e1", name: "Jabulile Mashibini", employeeId: "4021", role: "Front Desk", site: "Bloemfontein", status: "Active", lastActive: "2 min ago" },
  { id: "e2", name: "TT Mapeshoane", employeeId: "4022", role: "Warehouse", site: "Bloemfontein", status: "Active", lastActive: "Just now" },
  { id: "e3", name: "Lionel van der Merwe", employeeId: "4023", role: "Dock Supervisor", site: "Potchefstroom", status: "Active", lastActive: "30 min ago" },
  { id: "e4", name: "Oscar Poco", employeeId: "4024", role: "Forklift Operator", site: "Johannesburg", status: "Invited", lastActive: null },
  { id: "e5", name: "TT Mapeshoane", employeeId: "4025", role: "Dock Worker", site: "Potchefstroom", status: "Suspended", lastActive: "5 days ago" },
];

export const exceptionsSeed: ExceptionRequest[] = [
  { id: "x1", employee: "Lionel van der Merwe", type: "Late", date: "Jul 9", reason: "Traffic delay on I-40", submitted: "18 min ago", status: "Pending" },
  { id: "x2", employee: "Oscar Poco", type: "Early Leave", date: "Jul 8", reason: "Medical appointment", submitted: "1 hr ago", status: "Pending" },
  { id: "x3", employee: "TT Mapeshoane", type: "Absence", date: "Jul 6", reason: "No documentation provided", submitted: "1 day ago", status: "Pending" },
  { id: "x4", employee: "Jabulile Mashibini", type: "Late", date: "Jul 5", reason: "Load shedding", submitted: "4 days ago", status: "Approved" },
  { id: "x5", employee: "Oscar Poco", type: "Absence", date: "Jul 2", reason: "Family emergency", submitted: "1 week ago", status: "Denied" },
];

export const audit: AuditEntry[] = [
  { id: "l1", timestamp: "Jul 9, 2:12 PM", actor: "Jabulile Mashibini", action: "Approved Early Leave request", target: "Oscar Poco" },
  { id: "l2", timestamp: "Jul 9, 11:04 AM", actor: "Jabulile Mashibini", action: "Updated geofence radius", target: "Potchefstroom" },
  { id: "l3", timestamp: "Jul 8, 4:47 PM", actor: "Lionel van der Merwe", action: "Denied Absence request", target: "TT Mapeshoane" },
  { id: "l4", timestamp: "Jul 8, 2:15 PM", actor: "Lionel van der Merwe", action: "Invited new employee", target: "Oscar Poco" },
  { id: "l5", timestamp: "Jul 7, 9:30 AM", actor: "Jabulile Mashibini", action: "Suspended employee record", target: "TT Mapeshoane" },
  { id: "l6", timestamp: "Jul 6, 8:02 AM", actor: "System", action: "Admin login", target: "Jabulile Mashibini" },
];

export const weeklyHours = [
  { day: "Mon", h: 104, logged: true },
  { day: "Tue", h: 126, logged: true },
  { day: "Wed", h: 92, logged: false },
  { day: "Thu", h: 118, logged: false },
  { day: "Fri", h: 110, logged: false },
  { day: "Sat", h: 40, logged: false },
  { day: "Sun", h: 24, logged: false },
];

export const bySite = [
  { name: "Bloemfontein", inNow: 34, total: 40 },
  { name: "Potchefstroom", inNow: 28, total: 35 },
  { name: "Johannesburg", inNow: 15, total: 28 },
  { name: "Cape Town", inNow: 9, total: 25 },
];
