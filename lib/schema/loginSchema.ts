import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email().min(3, {
    message: "Email is required.",
  }),
  password: z.string().min(3, { message: "password is required" }),
});
