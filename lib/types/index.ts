import { cartItemSchema } from "../validation/validator";
import { shippingAddressSchema } from "../validation/validator";
import { paymentResultSchema } from "../validation/validator";
import { z } from "zod";

//CART

export type CartItem = z.infer<typeof cartItemSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentResult = z.infer<typeof paymentResultSchema>;

import { Order as PrismaOrder } from "@prisma/client";
import { OrderItem } from "@prisma/client";

// Type for Order with nested relations
export type Order = PrismaOrder & {
  orderItems: OrderItem[];
  user: { name: string | null; email: string | null };
  shippingAddress: ShippingAddress;
};
