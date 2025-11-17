import { authenticatedRole, anonRole, serviceRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

// Export Supabase built-in roles
export { authenticatedRole, anonRole, serviceRole };

// Helper to get current authenticated user ID
export const authUid = () => sql`(auth.uid())`;
