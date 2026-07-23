import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  mergeKhusbassadorConfig,
  type KhusbassadorConfig,
} from "@/lib/firestore";

export async function getKhusbassadorConfig(): Promise<KhusbassadorConfig> {
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("data")
      .eq("id", "khusbassador")
      .single();

    return mergeKhusbassadorConfig(data?.data || null);
  } catch (error) {
    console.error("Failed to load Khusbassador config (server)", error);
    return mergeKhusbassadorConfig(null);
  }
}
