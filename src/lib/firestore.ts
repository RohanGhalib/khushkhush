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
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
}
