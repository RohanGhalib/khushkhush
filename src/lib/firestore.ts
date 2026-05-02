import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

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

export async function updateUserProfile(uid: string, data: any) {
  const userRef = doc(db, "users", uid);
  try {
    await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("Error updating user document", error);
  }
}
