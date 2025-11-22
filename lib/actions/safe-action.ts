import { getAuthenticatedUserId } from "@/lib/api/auth";
import { z } from "zod";

export type ActionContext = {
  userId: string;
};

export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>
) {
  return async (input: TInput): Promise<TOutput> => {
    const { userId } = await getAuthenticatedUserId();

    const validationResult = schema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ");
      throw new Error(`Validation Error: ${errorMessage}`);
    }

    try {
      return await handler(validationResult.data, { userId });
    } catch (error) {
      console.error("Action execution failed:", error);
      throw error instanceof Error ? error : new Error("An unexpected error occurred");
    }
  };
}
