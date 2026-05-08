import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export type UserRole = "user" | "admin" | "ambassador";
export type AmbassadorStatus = "pending" | "active" | "rejected";

export interface AmbassadorApplication {
  id: string;
  name: string;
  email: string;
  instagram: string;
  college: string;
  reason: string;
  status: AmbassadorStatus;
  createdAt: unknown;
  userId?: string;
}

export interface VaultBalance {
  balance: number;
  updatedAt?: unknown;
}

export interface ReferralRecord {
  orderId: string;
  ambassadorId: string;
  referralCode: string;
  amountAddedToVault: number;
  amountEarnedByAmbassador: number;
  shirtCount: number;
  college?: string;
  createdAt: unknown;
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
        role: "user" as UserRole,
        college: "",
        referralCode: "",
        ambassadorStatus: "rejected" as AmbassadorStatus,
        ambassadorEarnings: 0,
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
