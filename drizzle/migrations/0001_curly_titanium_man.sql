ALTER TABLE "reviews" DROP CONSTRAINT "reviews_account_id_accounts_id_fk";
--> statement-breakpoint
DROP INDEX "reviews_account_id_idx";--> statement-breakpoint
DROP INDEX "reviews_account_business_idx";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "account_id";--> statement-breakpoint
ALTER POLICY "reviews_select_associated" ON "reviews" TO authenticated USING (EXISTS (
        SELECT 1 FROM businesses b
        INNER JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = "reviews"."business_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
ALTER POLICY "reviews_insert_associated" ON "reviews" TO authenticated WITH CHECK (EXISTS (
        SELECT 1 FROM businesses b
        INNER JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = "reviews"."business_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
ALTER POLICY "reviews_update_associated" ON "reviews" TO authenticated USING (EXISTS (
        SELECT 1 FROM businesses b
        INNER JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = "reviews"."business_id"
        AND ua.user_id = (auth.uid())
      ));--> statement-breakpoint
ALTER POLICY "reviews_delete_owner" ON "reviews" TO authenticated USING (EXISTS (
        SELECT 1 FROM businesses b
        INNER JOIN user_accounts ua ON ua.account_id = b.account_id
        WHERE b.id = "reviews"."business_id"
        AND ua.user_id = (auth.uid())
        AND ua.role = 'owner'
      ));