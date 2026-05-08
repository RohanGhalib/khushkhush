import "server-only";

import { existsSync, readFileSync } from "fs";
import path from "path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  const localServiceAccountPath = path.join(process.cwd(), "service-account.json");
  if (existsSync(localServiceAccountPath)) {
    return cert(JSON.parse(readFileSync(localServiceAccountPath, "utf8")));
  }

  return applicationDefault();
}

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: getCredential(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
