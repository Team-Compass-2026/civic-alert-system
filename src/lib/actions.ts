import { supabase } from "@/integrations/supabase/client";
import { getAnonToken, rememberMyReport } from "@/lib/device";
import type { ReportType } from "@/lib/waterwatch";

export type NewReport = {
  type: ReportType;
  description: string;
  whenHappened: string;
  lat: number;
  lng: number;
  areaId: string | null;
  isAnonymous: boolean;
  photo?: File | null;
};

export async function submitReport(input: NewReport): Promise<string> {
  let photoPath: string | null = null;

  if (input.photo) {
    const ext = input.photo.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("report-photos")
      .upload(path, input.photo, { upsert: false });
    if (upErr) throw upErr;
    const { data: signed } = await supabase.storage
      .from("report-photos")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    photoPath = signed?.signedUrl ?? null;
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      type: input.type,
      description: input.description || null,
      when_happened: input.whenHappened || null,
      lat: input.lat,
      lng: input.lng,
      area_id: input.areaId,
      is_anonymous: input.isAnonymous,
      photo_url: photoPath,
      anon_token: getAnonToken(),
    })
    .select("id")
    .single();

  if (error) throw error;
  rememberMyReport(data.id as string);
  return data.id as string;
}

export async function verifyReport(
  reportId: string,
  value: "confirm" | "dispute",
): Promise<void> {
  const { error } = await supabase.from("verifications").upsert(
    {
      report_id: reportId,
      anon_token: getAnonToken(),
      value,
    },
    { onConflict: "report_id,anon_token", ignoreDuplicates: true },
  );
  if (error) throw error;
}
