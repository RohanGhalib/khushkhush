import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function setupCors() {
  const bucketName = process.env.R2_BUCKET;
  
  console.log(`🚀 Configuring CORS for bucket: ${bucketName}...`);

  const corsConfig = {
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [
            "https://www.khushkhush.com",
            "https://khushkhush.com",
            "http://localhost:3000",
            "https://khushkhush.vercel.app" // Add your Vercel URL if different
          ],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  };

  try {
    await S3.send(new PutBucketCorsCommand(corsConfig));
    console.log("✅ CORS configuration updated successfully!");
    console.log("   Browser uploads should now work from allowed origins.");
  } catch (error) {
    console.error("❌ Failed to update CORS:", error.message);
    process.exit(1);
  }
}

setupCors();
