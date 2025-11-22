CREATE TABLE "review_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"text" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_responses_status_check" CHECK ("review_responses"."status" IN ('generated', 'approved', 'rejected'))
);
--> statement-breakpoint
ALTER TABLE "review_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_responses_business_id_idx" ON "review_responses" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_responses_review_id_idx" ON "review_responses" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_responses_status_idx" ON "review_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_responses_created_at_idx" ON "review_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_responses_business_status_created_idx" ON "review_responses" USING btree ("business_id","status","created_at");--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "ai_reply";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "ai_reply_generated_at";--> statement-breakpoint
CREATE POLICY "review_responses_select_associated" ON "review_responses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "review_responses"."account_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
CREATE POLICY "review_responses_insert_associated" ON "review_responses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = "review_responses"."account_id"
        AND ua.user_id = (auth.uid())
      ));