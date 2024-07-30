"use server";
import prisma from "@/prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { signupSchema } from "./signup-form";

export const signUp = async (values: z.infer<typeof signupSchema>) => {
  try {
    // if user already exists, throw an error
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
    if (existingUser) {
      return { error: "User already exists", success: false };
    }

    // Utility function to generate student ID

    const hashedPassword = bcrypt.hashSync(values.password, 10);

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        password: hashedPassword,
      },
    });

    return { message: "Account created successfully", success: true };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "Something went wrong", success: false };
  }
};
