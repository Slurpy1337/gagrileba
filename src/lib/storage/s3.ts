import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export function getS3Client() {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: "auto",
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}
