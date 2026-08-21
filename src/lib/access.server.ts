import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "admin" | "org" | "citizen";

export type MyAccess = {
  userId: string;
  roles: AppRole[];
  /** Areas a role is explicitly pinned to (empty = no role-level pin). */
  roleAreaIds: string[];
  /** The citizen's own home area. */
  profileAreaId: string | null;
  canViewDashboard: boolean;
};

type Ctx = { supabase: SupabaseClient<any, any, any>; userId: string };

/** Reads the caller's roles + home area as the signed-in user (RLS applies). */
export async function loadAccess(context: Ctx): Promise<MyAccess> {
  const { data: roleRows, error: roleError } = await context.supabase
    .from("user_roles")
    .select("role, area_id")
    .eq("user_id", context.userId);
  if (roleError) throw roleError;

  const { data: profile } = await context.supabase
    .from("profiles")
    .select("area_id")
    .eq("user_id", context.userId)
    .maybeSingle();

  const roles = (roleRows ?? []).map((r: { role: string }) => r.role as AppRole);
  const roleAreaIds = (roleRows ?? [])
    .map((r: { area_id: string | null }) => r.area_id)
    .filter((id: string | null): id is string => Boolean(id));

  return {
    userId: context.userId,
    roles: roles.length > 0 ? roles : ["citizen"],
    roleAreaIds,
    profileAreaId: (profile as { area_id: string | null } | null)?.area_id ?? null,
    canViewDashboard: roles.includes("admin") || roles.includes("org"),
  };
}

/** Areas the caller is allowed to open, or `null` when unrestricted. */
export function allowedAreaIds(access: MyAccess): string[] | null {
  if (access.roles.includes("admin")) return null;
  if (access.roles.includes("org")) {
    return access.roleAreaIds.length > 0 ? access.roleAreaIds : null;
  }
  return access.profileAreaId ? [access.profileAreaId] : [];
}

export const FORBIDDEN_DASHBOARD =
  "Forbidden: your account is not authorized for the organization dashboard.";
export const FORBIDDEN_AREA =
  "Forbidden: this area is outside your authorized scope.";
