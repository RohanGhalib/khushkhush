import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabaseAdmin";

export type UserRole = "user" | "admin" | "ambassador" | "customer";
export type AmbassadorStatus = "pending" | "active" | "rejected";

export const KHUSBASSADOR_CONFIG = {
  retailShirtPrice: 2000,
  baseShirtCost: 1400,
  customerDiscountPerShirt: 200,
  ambassadorCoinsPerShirt: 100,
  vaultContributionPerShirt: 300,
  vaultGoal: 50000,
  vaultDocumentId: "khush-fund",
  coinValuePkr: 1,
  maxCoinRedemptionPercent: 50,
  iconTierSales: 10,
  legendTierSales: 25,
} as const;

export type KhusbassadorConfig = {
  retailShirtPrice: number;
  baseShirtCost: number;
  customerDiscountPerShirt: number;
  ambassadorCoinsPerShirt: number;
  vaultContributionPerShirt: number;
  vaultGoal: number;
  vaultDocumentId: string;
  coinValuePkr: number;
  maxCoinRedemptionPercent: number;
  iconTierSales: number;
  legendTierSales: number;
};

export const KHUSBASSADOR_SETTINGS_DOC = { collection: "settings", id: "khusbassador" } as const;

const NUMERIC_KEYS: (keyof KhusbassadorConfig)[] = [
  "retailShirtPrice",
  "baseShirtCost",
  "customerDiscountPerShirt",
  "ambassadorCoinsPerShirt",
  "vaultContributionPerShirt",
  "vaultGoal",
  "coinValuePkr",
  "maxCoinRedemptionPercent",
  "iconTierSales",
  "legendTierSales",
];

export function mergeKhusbassadorConfig(override?: Record<string, unknown> | null): KhusbassadorConfig {
  const merged: KhusbassadorConfig = { ...KHUSBASSADOR_CONFIG };
  if (!override) return merged;

  for (const key of NUMERIC_KEYS) {
    const raw = override[key];
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(num) && num >= 0) {
      (merged[key] as number) = num;
    }
  }
  if (typeof override.vaultDocumentId === "string" && override.vaultDocumentId.trim()) {
    merged.vaultDocumentId = override.vaultDocumentId.trim();
  }
  return merged;
}

export async function fetchKhusbassadorConfig(): Promise<KhusbassadorConfig> {
  try {
    const { data } = await supabase
      .from("settings")
      .select("data")
      .eq("id", "khusbassador")
      .single();
    return mergeKhusbassadorConfig(data?.data || null);
  } catch (error) {
    console.error("Failed to load Khusbassador config", error);
    return mergeKhusbassadorConfig(null);
  }
}

export interface KhushUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_admin?: boolean;
  college?: string;
  referralCode?: string;
  ambassadorStatus?: AmbassadorStatus;
  instagramHandle?: string;
  ambassadorPitch?: string;
  khushCoins?: number;
  khushCoinsEarned?: number;
  khushCoinsSpent?: number;
  ambassadorSales?: number;
  ambassadorReferralUses?: number;
}

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  college?: string;
  referralCode?: string;
  role?: UserRole;
  is_admin?: boolean;
  ambassadorStatus?: AmbassadorStatus;
}

export async function createUserDocument(uid: string, data: { email: string; name: string; phone?: string }) {
  try {
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", uid)
      .single();

    if (!existing) {
      await supabaseAdmin.from("users").insert({
        id: uid,
        email: data.email,
        name: data.name,
        phone: data.phone || "",
        role: "user",
        is_admin: false,
        college: "",
        referral_code: "",
        ambassador_status: "rejected",
        khush_coins: 0,
        khush_coins_earned: 0,
        khush_coins_spent: 0,
        ambassador_sales: 0,
        ambassador_referral_uses: 0,
        wishlist: [],
      });
      return true;
    }
  } catch (error) {
    console.error("Error creating user profile in Supabase:", error);
  }
  return false;
}

export async function getUserProfile(uid: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", uid)
      .single();
    if (error || !data) return null;
    return {
      ...data,
      referralCode: data.referral_code,
      ambassadorStatus: data.ambassador_status,
      instagramHandle: data.instagram_handle,
      ambassadorPitch: data.ambassador_pitch,
      khushCoins: data.khush_coins,
      khushCoinsEarned: data.khush_coins_earned,
      khushCoinsSpent: data.khush_coins_spent,
      ambassadorSales: data.ambassador_sales,
      ambassadorReferralUses: data.ambassador_referral_uses,
      isAdmin: data.is_admin || data.role === "admin",
    };
  } catch (err) {
    console.error("Error getting user profile:", err);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: UserProfileUpdate) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) payload.name = data.name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.college !== undefined) payload.college = data.college;
  if (data.referralCode !== undefined) payload.referral_code = data.referralCode;
  if (data.role !== undefined) payload.role = data.role;
  if (data.is_admin !== undefined) payload.is_admin = data.is_admin;
  if (data.ambassadorStatus !== undefined) payload.ambassador_status = data.ambassadorStatus;

  const { error } = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", uid);
  if (error) throw error;
}
