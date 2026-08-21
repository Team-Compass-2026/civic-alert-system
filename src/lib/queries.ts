import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  AlertItem,
  AreaRisk,
  ReportFeedItem,
  SignalTrend,
} from "@/lib/waterwatch";


export const areasQuery = queryOptions({
  queryKey: ["areas"],
  queryFn: async (): Promise<AreaRisk[]> => {
    const { data, error } = await supabase
      .from("v_area_risk")
      .select("*")
      .order("score", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as AreaRisk[];
  },
});

export const reportFeedQuery = queryOptions({
  queryKey: ["report-feed"],
  queryFn: async (): Promise<ReportFeedItem[]> => {
    const { data, error } = await supabase
      .from("v_report_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data ?? []) as unknown as ReportFeedItem[];
  },
});

export const alertsQuery = queryOptions({
  queryKey: ["alerts"],
  queryFn: async (): Promise<AlertItem[]> => {
    const { data, error } = await supabase
      .from("v_alert_feed")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as AlertItem[];
  },
});

export const signalTrendsQuery = queryOptions({
  queryKey: ["signal-trends"],
  queryFn: async (): Promise<SignalTrend[]> => {
    const { data, error } = await supabase
      .from("v_signal_trends")
      .select("*")
      .order("current_count", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as SignalTrend[];
  },
});

