/**
 * One-time script to set the Firebase Admin custom claim on your account.
 *
 * Prerequisites:
 *   1. Download your Firebase service account key from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save it as `service-account.json` in the project root (it's in .gitignore)
 *   3. Run: node scripts/set-admin-claim.mjs YOUR_USER_UID
 *
 * To find your UID:
 *   Firebase Console → Authentication → Users → copy the User UID column
 *
 * After running this script:
 *   - Sign out and sign back in so Firebase refreshes your ID token
 *   - You will have full admin access via custom claims only (no hardcoded emails)
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const uid = process.argv[2];
if (!uid) {
  console.error("❌ Usage: node scripts/set-admin-claim.mjs <USER_UID>");
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
    "❌ service-account.json not found.\n" +
    "   Download it from Firebase Console → Project Settings → Service Accounts"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdminClaim() {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    const user = await admin.auth().getUser(uid);
    console.log(`✅ Admin claim set for: ${user.email} (${uid})`);
    console.log("   Sign out and sign back in to refresh your ID token.");
  } catch (error) {
    console.error("❌ Failed to set admin claim:", error.message);
    process.exit(1);
  }
}

setAdminClaim();
