import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./lib/schema/loginSchema";
import { getUserByEmail } from "./lib/action/user.action";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // Ensure credentials are defined
        if (credentials == null) return null;

        // Validate the credentials using zod schema
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          throw new Error("Invalid credentials");
        }

        const { email, password } = validatedFields.data;

        // Fetch the user by email
        const user = await getUserByEmail(email);
        if (!user || !user.password) {
          throw new Error("No user found");
        }

        // Compare the password
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          throw new Error("Password mismatch");
        }

        // Return user if successful
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
