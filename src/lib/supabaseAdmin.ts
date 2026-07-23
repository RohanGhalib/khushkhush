import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hulssptnpypmgibsijwc.supabase.co";
// Uses SUPABASE_SERVICE_ROLE_KEY if set, otherwise falls back to publishable key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_lWz4bkduxrmwtvy1QfJfmQ_ApwQKG0X";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
