import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Role- and area-scoped access checks. These run as the signed-in user through
 * the Supabase auth middleware, so the browser can never widen its own scope.
 */

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

type Ctx = { supabase: any; userId: string };

async function loadAccess(context: Ctx): Promise<MyAccess> {
  {
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

    const roles = (roleRows ?? []).map((r) => r.role as AppRole);
    const roleAreaIds = (roleRows ?? [])
      .map((r) => r.area_id)
      .filter((id): id is string => Boolean(id));

    return {
      userId: context.userId,
      roles: roles.length > 0 ? roles : ["citizen"],
      roleAreaIds,
      profileAreaId: profile?.area_id ?? null,
      canViewDashboard: roles.includes("admin") || roles.includes("org"),
    };
  }
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAccess> => loadAccess(context));

/** Areas the caller is allowed to open, or `null` when unrestricted. */
function allowedAreaIds(access: MyAccess): string[] | null {
  if (access.roles.includes("admin")) return null;
  if (access.roles.includes("org")) {
    return access.roleAreaIds.length > 0 ? access.roleAreaIds : null;
  }
  return access.profileAreaId ? [access.profileAreaId] : [];
}

/**
 * Dashboard area drill-down. Rejects slugs outside the caller's scope instead
 * of letting the browser fetch them.
 */
export const getAreaDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const access = await loadAccess(context);
    if (!access.canViewDashboard) {
      throw new Error("Forbidden: your account is not authorized for the organization dashboard.");
    }

    const { data: area, error: areaError } = await context.supabase
      .from("v_area_risk")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (areaError) throw areaError;
    if (!area) throw new Error("Area not found.");

    const allowed = allowedAreaIds(access);
    const areaId = (area as { area_id: string }).area_id;
    if (allowed && !allowed.includes(areaId)) {
      throw new Error("Forbidden: this area is outside your authorized scope.");
    }

    const { data: reports, error: reportError } = await context.supabase
      .from("v_report_feed")
      .select("*")
      .eq("area_id", areaId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (reportError) throw reportError;

    return { area, reports: reports ?? [] };
  });

/** Areas the caller may see on the dashboard index, already scoped. */
export const getScopedAreas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const access = await loadAccess(context);
    if (!access.canViewDashboard) {
      throw new Error("Forbidden: your account is not authorized for the organization dashboard.");
    }

    let query = context.supabase.from("v_area_risk").select("*");
    const allowed = allowedAreaIds(access);
    if (allowed) query = query.in("area_id", allowed.length > 0 ? allowed : [""]);

    const { data, error } = await query.order("score", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
