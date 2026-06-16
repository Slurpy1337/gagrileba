import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/gagrileba"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://gagrileba.ge"),
  AUTH_SECRET: z.string().min(16).default("local-dev-secret-change-in-production"),
  BOG_CLIENT_ID: z.string().optional(),
  BOG_CLIENT_SECRET: z.string().optional(),
  BOG_API_URL: z.string().url().default("https://api.bog.ge"),
  BOG_AUTH_URL: z.string().url().default("https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token"),
  BOG_CALLBACK_PUBLIC_KEY: z.string().optional(),
  BOG_LOAN_TYPE: z.string().default("standard"),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  GA4_ID: z.string().optional(),
  META_PIXEL_ID: z.string().optional(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  BOG_CLIENT_ID: process.env.BOG_CLIENT_ID,
  BOG_CLIENT_SECRET: process.env.BOG_CLIENT_SECRET,
  BOG_API_URL: process.env.BOG_API_URL,
  BOG_AUTH_URL: process.env.BOG_AUTH_URL,
  BOG_CALLBACK_PUBLIC_KEY: process.env.BOG_CALLBACK_PUBLIC_KEY,
  BOG_LOAN_TYPE: process.env.BOG_LOAN_TYPE,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  GA4_ID: process.env.GA4_ID,
  META_PIXEL_ID: process.env.META_PIXEL_ID,
});
