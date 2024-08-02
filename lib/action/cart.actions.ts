"use server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { CartItem } from "../types";
import { round2 } from "../utils";
import { cartItemSchema } from "../validation/validator";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + item.price * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: Number(itemsPrice.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    taxPrice: Number(taxPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

export async function getMyCart() {
  const sessionCartId = cookies().get("sessionCartId")?.value;
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (!sessionCartId) return null;

  const cart = await prisma.cart.findFirst({
    where: {
      OR: [{ userId }, { sessionCartId }],
    },
  });

  if (!cart) return null;

  return {
    ...cart,
    items: cart.items as CartItem[], // Type assertion to specify items as CartItem[]
  };
}

export const addItemToCart = async (data: CartItem) => {
  try {
    let sessionCartId = cookies().get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart Session not found");

    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    const cart = await getMyCart();
    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      if (product.stock < 1) throw new Error("Not enough stock");

      const prices = calcPrice([item]);

      const cartData: any = {
        sessionCartId,
        items: [item],
        ...prices,
      };

      if (userId) {
        cartData.userId = userId;
      }

      await prisma.cart.create({
        data: cartData,
      });

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: "Item added to cart successfully",
      };
    } else {
      const existItem = cart.items.find((x) => x.productId === item.productId);
      if (existItem) {
        if (product.stock < existItem.qty + 1)
          throw new Error("Not enough stock");
        existItem.qty += 1;
      } else {
        if (product.stock < 1) throw new Error("Not enough stock");
        cart.items.push(item);
      }

      const prices = calcPrice(cart.items);

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...prices,
        },
      });

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart successfully`,
      };
    }
  } catch (error: any) {
    return { success: false, message: formatError(error) };
  }
};

export const removeItemFromCart = async (productId: string) => {
  try {
    const sessionCartId = cookies().get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const exist = cart.items.find((x: any) => x.productId === productId);
    if (!exist) throw new Error("Item not found");

    if (exist.qty === 1) {
      cart.items = cart.items.filter(
        (x: any) => x.productId !== exist.productId
      );
    } else {
      exist.qty -= 1;
    }

    const prices = calcPrice(cart.items);

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...prices,
      },
    });

    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: `${product.name} ${
        cart.items.find((x: any) => x.productId === productId)
          ? "updated in"
          : "removed from"
      } cart successfully`,
    };
  } catch (error: any) {
    return { success: false, message: formatError(error) };
  }
};
