"use server";
import prisma from "@/prisma/client";
import { ShippingAddress } from "../types";
import { auth } from "@/auth";
import { shippingAddressSchema } from "../validation/validator";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { paymentMethodSchema } from "../validation/validator";
import { z } from "zod";
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });
    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    // Check if the user already has an address
    const existingAddress = await prisma.address.findFirst({
      where: { userId: currentUser.id },
    });

    if (existingAddress) {
      // Update the existing address
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: { ...address },
      });
    } else {
      // Create a new address
      await prisma.address.create({
        data: { ...address, userId: currentUser.id },
      });
    }

    revalidatePath("/place-order");

    return {
      success: true,
      message: "User address updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    revalidatePath("/place-order");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
