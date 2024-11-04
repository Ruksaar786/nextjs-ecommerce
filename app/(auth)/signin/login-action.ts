"use server";

import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { loginSchema } from "@/lib/schema/loginSchema";
import { getUserByEmail } from "@/lib/action/user.action";
import { revalidatePath } from "next/cache";
export const signInWithCredentials = async (
  values: z.infer<typeof loginSchema>
) => {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  try {
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      return { success: false, error: response.error };
    }
    revalidatePath("/");
    return { success: true, message: "Sign in successfully" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid Credential!" };
        default:
          return { success: false, error: "Something went wrong" };
      }
    }
  }
};
