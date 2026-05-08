import "server-only";

import { adminDb } from "@/lib/firebaseAdmin";
import {
  KHUSBASSADOR_SETTINGS_DOC,
  mergeKhusbassadorConfig,
  type KhusbassadorConfig,
} from "@/lib/firestore";

export async function getKhusbassadorConfig(): Promise<KhusbassadorConfig> {
  try {
    const snap = await adminDb
      .collection(KHUSBASSADOR_SETTINGS_DOC.collection)
      .doc(KHUSBASSADOR_SETTINGS_DOC.id)
      .get();
    return mergeKhusbassadorConfig(snap.exists ? snap.data() : null);
  } catch (error) {
    console.error("Failed to load Khusbassador config (server)", error);
    return mergeKhusbassadorConfig(null);
  }
}
