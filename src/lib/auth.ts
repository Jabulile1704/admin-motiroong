/**
 * Admin auth gate — placeholder until the shared backend exists.
 *
 * When the backend lands (Supabase/Firebase/custom), replace this with
 * a real session check and enforce it in middleware.ts so every route
 * requires an admin role.
 */
export type AdminSession = { name: string; role: "admin" };

export function getAdminSession(): AdminSession {
  return { name: "Jabulile Mashibini", role: "admin" };
}
