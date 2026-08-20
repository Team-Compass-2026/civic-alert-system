import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server functions for the authenticated citizen profile. They run as the
 * signed-in user through the Supabase auth middleware, so RLS applies.
 */

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing, error: fetchError } = await context.supabase
      .from("profiles")
      .select("id, user_id, area_id")
      .eq("user_id", context.userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existing) return existing;

    // Fall back: create a bare profile if the trigger somehow missed it.
    const { data: created, error: insertError } = await context.supabase
      .from("profiles")
      .insert({ user_id: context.userId, area_id: null })
      .select("id, user_id, area_id")
      .single();

    if (insertError) throw insertError;
    return created;
  });

export const updateMyProfileArea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ areaId: z.string().uuid().nullable() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ area_id: data.areaId, updated_at: new Date().toISOString() })
      .eq("user_id", context.userId);

    if (error) throw error;
    return { ok: true };
  });
