CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"account_name" text NOT NULL,
	"google_refresh_token" text,
	"google_account_name" text,
	"paddle_customer_id" text,
	"subscription_id" text,
	"subscription_status" text,
	"plan_tier" text DEFAULT 'free',
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"last_synced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "business_configs" (
	"business_id" uuid PRIMARY KEY NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_configs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"google_business_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone_number" text,
	"website_url" text,
	"maps_url" text,
	"description" text,
	"photo_url" text,
	"email_on_new_review" boolean DEFAULT false NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_google_business_id_unique" UNIQUE("google_business_id")
);
--> statement-breakpoint
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"google_review_id" text NOT NULL,
	"google_review_name" text,
	"reviewer_name" text NOT NULL,
	"reviewer_photo_url" text,
	"is_anonymous" boolean DEFAULT false,
	"rating" integer NOT NULL,
	"text" text,
	"review_date" timestamp NOT NULL,
	"update_time" timestamp,
	"reply_status" text DEFAULT 'pending' NOT NULL,
	"ai_reply" text,
	"ai_reply_generated_at" timestamp,
	"posted_reply" text,
	"posted_at" timestamp,
	"posted_by" uuid,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_google_review_id_unique" UNIQUE("google_review_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_configs" ADD CONSTRAINT "business_configs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "users_view_their_accounts" ON "accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("accounts"."id" IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "owners_update_accounts" ON "accounts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("accounts"."id" IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    ));--> statement-breakpoint
CREATE POLICY "authenticated_create_accounts" ON "accounts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() IS NOT NULL);--> statement-breakpoint
CREATE POLICY "users_view_memberships" ON "user_accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_accounts"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "owners_manage_memberships" ON "user_accounts" AS PERMISSIVE FOR ALL TO "authenticated" USING ("user_accounts"."account_id" IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    ));--> statement-breakpoint
CREATE POLICY "users_view_business_configs" ON "business_configs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("business_configs"."business_id" IN (
      SELECT b.id FROM businesses b
      INNER JOIN user_accounts ua ON b.account_id = ua.account_id
      WHERE ua.user_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "owners_manage_business_configs" ON "business_configs" AS PERMISSIVE FOR ALL TO "authenticated" USING ("business_configs"."business_id" IN (
      SELECT b.id FROM businesses b
      INNER JOIN user_accounts ua ON b.account_id = ua.account_id
      WHERE ua.user_id = auth.uid() AND ua.role = 'owner'
    ));--> statement-breakpoint
CREATE POLICY "users_view_account_businesses" ON "businesses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("businesses"."account_id" IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "owners_manage_businesses" ON "businesses" AS PERMISSIVE FOR ALL TO "authenticated" USING ("businesses"."account_id" IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    ));--> statement-breakpoint
CREATE POLICY "users_view_account_reviews" ON "reviews" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("reviews"."account_id" IN (
      SELECT account_id FROM user_accounts WHERE user_id = auth.uid()
    ));--> statement-breakpoint
CREATE POLICY "owners_manage_reviews" ON "reviews" AS PERMISSIVE FOR ALL TO "authenticated" USING ("reviews"."account_id" IN (
      SELECT account_id FROM user_accounts
      WHERE user_id = auth.uid() AND role = 'owner'
    ));