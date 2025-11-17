import { authenticatedRole, anonRole, serviceRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

export { authenticatedRole, anonRole, serviceRole };

export const authUid = () => sql`(auth.uid())`;
