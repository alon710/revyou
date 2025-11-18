import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default("review-ai-reply"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default("review-ai-reply.firebaseapp.com"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().default("review-ai-reply.firebasestorage.app"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().default("595883094755"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().default("1:595883094755:web:da0eba401707f6a2f78bd6"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://ksxmuvlzsxcwbduealvd.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_PADDLE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_YEARLY: z.string().optional(),
  NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_YEARLY: z.string().optional(),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),

  FIREBASE_ADMIN_PROJECT_ID: z.string().default("review-ai-reply"),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),

  TOKEN_ENCRYPTION_SECRET: z.string().min(32),
  INTERNAL_API_SECRET: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().default("Bottie <noreply@bottie.ai>"),

  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),

  PUBSUB_TOPIC_NAME: z.string().default("gmb-review-notifications"),
});

function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    NEXT_PUBLIC_PADDLE_ENVIRONMENT: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
    NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_MONTHLY: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_MONTHLY,
    NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_YEARLY: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_STARTER_YEARLY,
    NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_MONTHLY,
    NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_YEARLY: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO_YEARLY,
  };

  const result = clientSchema.safeParse(clientEnv);

  if (!result.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check .env file.");
  }

  return result.data;
}

function validateServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("❌ Server environment variables cannot be accessed on the client side");
  }

  const serverEnv = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    TOKEN_ENCRYPTION_SECRET: process.env.TOKEN_ENCRYPTION_SECRET,
    INTERNAL_API_SECRET: process.env.INTERNAL_API_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    PADDLE_API_KEY: process.env.PADDLE_API_KEY,
    PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
    PUBSUB_TOPIC_NAME: process.env.PUBSUB_TOPIC_NAME,
  };

  if (isProduction) {
    const result = serverSchema.safeParse(serverEnv);

    if (!result.success) {
      console.error("❌ Missing required server environment variables in production:");
      console.error(result.error.flatten().fieldErrors);
      throw new Error("Missing required server environment variables. Check .env.example for required values.");
    }

    return result.data;
  }

  const result = serverSchema.safeParse(serverEnv);

  if (result.success) {
    return result.data;
  }

  const missingFields = result.error.flatten().fieldErrors;
  const allowedMissingInDev = ["TOKEN_ENCRYPTION_SECRET", "INTERNAL_API_SECRET"];
  const actualMissing = Object.keys(missingFields);

  const onlyAllowedMissing = actualMissing.every((field) => allowedMissingInDev.includes(field));

  if (onlyAllowedMissing) {
    if (!serverEnv.INTERNAL_API_SECRET) {
      console.warn(
        "⚠️  INTERNAL_API_SECRET not set, using fallback for development. " +
          "Generate one with: openssl rand -base64 32"
      );
    }
    if (!serverEnv.TOKEN_ENCRYPTION_SECRET) {
      console.warn(
        "⚠️  TOKEN_ENCRYPTION_SECRET not set, using fallback for development. " +
          "Generate one with: openssl rand -base64 32"
      );
    }

    return serverSchema.parse({
      ...serverEnv,
      INTERNAL_API_SECRET: serverEnv.INTERNAL_API_SECRET || "dev-internal-secret-change-in-production",
      TOKEN_ENCRYPTION_SECRET: serverEnv.TOKEN_ENCRYPTION_SECRET || "dev-token-encryption-secret-min-32-chars",
    });
  }

  console.error("❌ Missing required server environment variables:");
  console.error(missingFields);
  throw new Error("Missing required server environment variables. Check .env.example for required values.");
}

export const clientEnv = validateClientEnv();

let _serverEnv: z.infer<typeof serverSchema> | null = null;

export const serverEnv = new Proxy({} as z.infer<typeof serverSchema>, {
  get(_target, prop) {
    if (!_serverEnv) {
      _serverEnv = validateServerEnv();
    }
    return _serverEnv[prop as keyof typeof _serverEnv];
  },
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

export const INTERNAL_API_SECRET = serverEnv.INTERNAL_API_SECRET;
export const TOKEN_ENCRYPTION_SECRET = serverEnv.TOKEN_ENCRYPTION_SECRET;
