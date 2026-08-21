import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MyAccess } from "@/lib/access.server";

/**
 * Role- and area-scoped access checks. These run as the signed-in user through
 * the Supabase auth middleware, so the browser can never widen its own scope.
 */

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAccess> => {
    const { loadAccess } = await import("@/lib/access.server");
    return loadAccess(context);
  });

/**
 * Dashboard area drill-down. Rejects slugs outside the caller's scope instead
 * of letting the browser fetch them.
 */
export const getAreaDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { loadAccess, allowedAreaIds, FORBIDDEN_AREA, FORBIDDEN_DASHBOARD } =
      await import("@/lib/access.server");

    const access = await loadAccess(context);
    if (!access.canViewDashboard) throw new Error(FORBIDDEN_DASHBOARD);

    const { data: area, error: areaError } = await context.supabase
      .from("v_area_risk")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (areaError) throw areaError;
    if (!area) throw new Error("Area not found.");

    const areaId = (area as { area_id: string }).area_id;
    const allowed = allowedAreaIds(access);
    if (allowed && !allowed.includes(areaId)) throw new Error(FORBIDDEN_AREA);

    const { data: reports, error: reportError } = await context.supabase
      .from("v_report_feed")
      .select("*")
      .eq("area_id", areaId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (reportError) throw reportError;

    const { data: alerts, error: alertError } = await context.supabase
      .from("v_alert_feed")
      .select("*")
      .eq("area_id", areaId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (alertError) throw alertError;

    return { area, reports: reports ?? [], alerts: alerts ?? [] };
  });

/** Areas the caller may see on the dashboard index, already scoped. */
export const getScopedAreas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadAccess, allowedAreaIds, FORBIDDEN_DASHBOARD } = await import(
      "@/lib/access.server"
    );

    const access = await loadAccess(context);
    if (!access.canViewDashboard) throw new Error(FORBIDDEN_DASHBOARD);

    let query = context.supabase.from("v_area_risk").select("*");
    const allowed = allowedAreaIds(access);
    if (allowed) query = query.in("area_id", allowed.length > 0 ? allowed : [""]);

    const { data, error } = await query.order("score", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
