import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
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
        role: "customer",
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
