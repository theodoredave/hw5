import { z } from "zod";

export const updateDocSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  userId: z.string().optional(),
  announceId: z.string().optional(),
});
