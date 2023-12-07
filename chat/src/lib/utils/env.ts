import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
});
type Env = z.infer<typeof envSchema>;

export const env: Env = {
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL!,
};

envSchema.parse(env);