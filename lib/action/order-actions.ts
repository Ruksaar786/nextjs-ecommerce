"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.action";
import { redirect } from "next/navigation";
import { insertOrderSchema } from "../validation/validator";
import prisma from "@/prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect";
import { formatError } from "../utils";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { paymentResultSchema } from "../validation/validator";
//GET
export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

// CREATE
export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");
    const cart = await getMyCart();
    const user = await getUserById(session?.user?.id!);
    if (!cart || cart.items.length === 0) redirect("/cart");
    if (!user?.address) redirect("/shipping-address");
    if (!user.paymentMethod) redirect("/payment-method");

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address[0],
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: order,
      });

      const orderItemsData = cart.items.map((item) => ({
        ...item,
        price: Number(item.price.toFixed(2)),
        orderId: newOrder.id,
      }));
      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return newOrder.id;
    });

    if (!insertedOrder) throw new Error("Order not created");
    redirect(`/order/${insertedOrder}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

// update

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0",
          },
        },
      });

      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in PayPal payment");

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true }, // Include order items in the query
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  await prisma.$transaction(async (tx) => {
    // Update the stock for each product in the order
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty, // Decrement stock by the quantity ordered
          },
        },
      });
    }

    // Update the order to mark it as paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: paymentResult || undefined, // Update payment result if provided
      },
    });
  });
};
