CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"configs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_configs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users_configs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"account_name" text NOT NULL,
	"google_account_name" text,
	"google_refresh_token" text NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_accounts_user_id_account_id_pk" PRIMARY KEY("user_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_tier" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"google_business_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"phone_number" text,
	"website_url" text,
	"maps_url" text,
	"review_url" text,
	"description" text,
	"photo_url" text,
	"tone_of_voice" text DEFAULT 'friendly' NOT NULL,
	"language_mode" text DEFAULT 'auto-detect' NOT NULL,
	"max_sentences" integer,
	"allowed_emojis" jsonb,
	"signature" text,
	"star_configs" jsonb NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "businesses_google_business_id_unique" UNIQUE("google_business_id")
);
--> statement-breakpoint
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"google_review_id" text NOT NULL,
	"google_review_name" text,
	"name" text NOT NULL,
	"photo_url" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"rating" integer NOT NULL,
	"text" text,
	"date" timestamp with time zone NOT NULL,
	"reply_status" text DEFAULT 'pending' NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_time" timestamp with time zone,
	CONSTRAINT "reviews_google_review_id_unique" UNIQUE("google_review_id"),
	CONSTRAINT "reviews_reply_status_check" CHECK ("reviews"."reply_status" IN ('pending', 'rejected', 'posted', 'failed', 'quota_exceeded'))
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"text" text NOT NULL,
	"status" text NOT NULL,
	"is_imported" boolean DEFAULT false NOT NULL,
	"generated_by" uuid,
	"posted_by" uuid,
	"posted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_responses_status_check" CHECK ("review_responses"."status" IN ('draft', 'posted', 'rejected'))
);
--> statement-breakpoint
ALTER TABLE "review_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "weekly_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"week_end_date" date NOT NULL,
	"total_reviews" integer NOT NULL,
	"average_rating" real NOT NULL,
	"positive_themes" jsonb DEFAULT '[]'::jsonb,
	"negative_themes" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_summaries_business_week_unique" UNIQUE("business_id","week_start_date","week_end_date")
);
--> statement-breakpoint
ALTER TABLE "weekly_summaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users_configs" ADD CONSTRAINT "users_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "weekly_summaries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_configs_user_id_idx" ON "users_configs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_email_idx" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "accounts_connected_at_idx" ON "accounts" USING btree ("connected_at");--> statement-breakpoint
CREATE INDEX "user_accounts_user_id_idx" ON "user_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_accounts_account_id_idx" ON "user_accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_user_status_idx" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "businesses_account_id_idx" ON "businesses" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "businesses_google_business_id_idx" ON "businesses" USING btree ("google_business_id");--> statement-breakpoint
CREATE INDEX "businesses_connected_idx" ON "businesses" USING btree ("connected");--> statement-breakpoint
CREATE INDEX "businesses_account_connected_idx" ON "businesses" USING btree ("account_id","connected");--> statement-breakpoint
CREATE INDEX "reviews_account_id_idx" ON "reviews" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "reviews_business_id_idx" ON "reviews" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "reviews_google_review_id_idx" ON "reviews" USING btree ("google_review_id");--> statement-breakpoint
CREATE INDEX "reviews_reply_status_idx" ON "reviews" USING btree ("reply_status");--> statement-breakpoint
CREATE INDEX "reviews_received_at_idx" ON "reviews" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "reviews_account_business_idx" ON "reviews" USING btree ("account_id","business_id");--> statement-breakpoint
CREATE INDEX "reviews_business_status_idx" ON "reviews" USING btree ("business_id","reply_status");--> statement-breakpoint
CREATE INDEX "reviews_received_status_idx" ON "reviews" USING btree ("received_at","reply_status");--> statement-breakpoint
CREATE INDEX "review_responses_business_id_idx" ON "review_responses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_responses_review_id_idx" ON "review_responses" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_responses_status_idx" ON "review_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_responses_created_at_idx" ON "review_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_responses_business_status_created_idx" ON "review_responses" USING btree ("business_id","status","created_at");--> statement-breakpoint
CREATE INDEX "weekly_summaries_business_week_idx" ON "weekly_summaries" USING btree ("business_id","week_start_date","week_end_date");--> statement-breakpoint
CREATE POLICY "users_configs_select_own" ON "users_configs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid()) = "users_configs"."user_id");--> statement-breakpoint
CREATE POLICY "users_configs_insert_own" ON "users_configs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid()) = "users_configs"."user_id");--> statement-breakpoint
CREATE POLICY "users_configs_update_own" ON "users_configs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid()) = "users_configs"."user_id");--> statement-breakpoint
CREATE POLICY "users_configs_delete_own" ON "users_configs" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid()) = "users_configs"."user_id");--> statement-breakpoint
CREATE POLICY "accounts_select_associated" ON "accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "accounts"."id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "accounts_insert_authenticated" ON "accounts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "accounts_update_owner" ON "accounts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "accounts"."id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "accounts_delete_owner" ON "accounts" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "accounts"."id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "user_accounts_select_own" ON "user_accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid()) = "user_accounts"."user_id");--> statement-breakpoint
CREATE POLICY "user_accounts_insert_owner" ON "user_accounts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "user_accounts"."account_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "user_accounts_update_owner" ON "user_accounts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "user_accounts"."account_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "user_accounts_delete_owner" ON "user_accounts" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "user_accounts"."account_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "subscriptions_select_own" ON "subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid()) = "subscriptions"."user_id");--> statement-breakpoint
CREATE POLICY "subscriptions_insert_own" ON "subscriptions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid()) = "subscriptions"."user_id");--> statement-breakpoint
CREATE POLICY "subscriptions_update_own" ON "subscriptions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid()) = "subscriptions"."user_id");--> statement-breakpoint
CREATE POLICY "subscriptions_delete_own" ON "subscriptions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid()) = "subscriptions"."user_id");--> statement-breakpoint
CREATE POLICY "businesses_select_associated" ON "businesses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "businesses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "businesses_insert_associated" ON "businesses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "businesses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "businesses_update_associated" ON "businesses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "businesses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "businesses_delete_owner" ON "businesses" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "businesses"."account_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "reviews_select_associated" ON "reviews" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "reviews"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "reviews_insert_associated" ON "reviews" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "reviews"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "reviews_update_associated" ON "reviews" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "reviews"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "reviews_delete_owner" ON "reviews" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "reviews"."account_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));--> statement-breakpoint
CREATE POLICY "review_responses_select_associated" ON "review_responses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "review_responses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "review_responses_insert_associated" ON "review_responses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "review_responses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "weekly_summaries_select_associated" ON "weekly_summaries" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "businesses" b
        JOIN "user_accounts" ua ON ua.account_id = b.account_id
        WHERE b.id = "weekly_summaries"."business_id"
        AND ua.user_id = (auth.uid())
      ));