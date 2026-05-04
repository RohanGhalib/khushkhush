/**
 * Script to set the Firebase Admin custom claim by email.
 *
 * Usage: node scripts/set-admin-by-email.mjs <USER_EMAIL>
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const email = process.argv[2];
if (!email) {
  console.error("❌ Usage: node scripts/set-admin-by-email.mjs <USER_EMAIL>");
  process.exit(1);
}

let admin;
try {
  admin = require("firebase-admin");
} catch {
  console.error(
    "❌ firebase-admin is not installed.\n" +
    "   Run: npm install -D firebase-admin\n" +
    "   Then re-run this script."
  );
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require("../service-account.json");
} catch {
  console.error(
    "❌ service-account.json not found in the root directory.\n" +
    "   Download it from Firebase Console → Project Settings → Service Accounts"
  );
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setAdminClaim() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`✅ Admin claim set for: ${user.email} (${uid})`);
    console.log("   Sign out and sign back in to refresh the ID token.");
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${email} not found.`);
    } else {
      console.error("❌ Failed to set admin claim:", error.message);
    }
    process.exit(1);
  }
}

setAdminClaim();
