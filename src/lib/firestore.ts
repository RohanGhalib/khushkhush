import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

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
    const snap = await getDoc(doc(db, KHUSBASSADOR_SETTINGS_DOC.collection, KHUSBASSADOR_SETTINGS_DOC.id));
    return mergeKhusbassadorConfig(snap.exists() ? snap.data() : null);
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

export interface KhushVault {
  balance: number;
  goal: number;
  updatedAt?: unknown;
}

export interface ReferralLedgerEntry {
  id?: string;
  orderId: string;
  ambassadorId: string;
  ambassadorEmail?: string;
  ambassadorCollege?: string;
  referralCode: string;
  shirtCount: number;
  orderSubtotal: number;
  amountAddedToVault: number;
  coinsEarnedByAmbassador: number;
  createdAt?: unknown;
}

export type CoinLedgerKind = "earn" | "redeem" | "adjust";

export interface CoinLedgerEntry {
  id?: string;
  userId: string;
  kind: CoinLedgerKind;
  amount: number;
  balanceAfter: number;
  orderId?: string;
  referralCode?: string;
  note?: string;
  createdAt?: unknown;
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
  ambassadorStatus?: AmbassadorStatus;
}

export async function createUserDocument(uid: string, data: { email: string; name: string; phone?: string }) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    try {
      await setDoc(userRef, {
        email: data.email,
        name: data.name,
        phone: data.phone || "",
        role: "user",
        college: "",
        referralCode: "",
        ambassadorStatus: "rejected",
        khushCoins: 0,
        khushCoinsEarned: 0,
        khushCoinsSpent: 0,
        ambassadorSales: 0,
        ambassadorReferralUses: 0,
        wishlist: [],
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error creating user", error);
    }
  }
  return false;
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function updateUserProfile(uid: string, data: UserProfileUpdate) {
  const userRef = doc(db, "users", uid);
  // Throws on failure so callers can handle errors rather than silently losing data
  await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
