import { z } from "zod";

export const updateMessageSchema = z.object({
  messageId: z.string().optional(),
  deleteFor: z.string().optional(),
});