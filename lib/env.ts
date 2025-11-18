import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  DATABASE_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  NEXT_PUBLIC_GCP_PROJECT_ID: z.string().min(1),
  PUBSUB_TOPIC_NAME: z.string().default("gmb-review-notifications"),

  GEMINI_API_KEY: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string(),

  TOKEN_ENCRYPTION_SECRET: z.string().min(32),
  INTERNAL_API_SECRET: z.string().min(32),

  NEXT_PUBLIC_APP_URL: z.string().url(),

  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_PADDLE_ENVIRONMENT: z.enum(["sandbox", "production"]).optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION === "true" || process.env.SKIP_ENV_VALIDATION === "1";

  if (shouldSkipValidation) {
    console.log("⚠️  Skipping environment validation (SKIP_ENV_VALIDATION=true)");
    return process.env as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. Check the errors above.");
  }

  return result.data;
}

export const env = validateEnv();
