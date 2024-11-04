// CART
import { z } from "zod";
import { formatNumberWithDecimal } from "../utils";
import { PAYMENT_METHODS } from "../constant";

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  qty: z.number().int().nonnegative("Quantity must be a non-negative number"),
  image: z.string().min(1, "Image is required"),
  price: z
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      "Price must have exactly two decimal places (e.g., 49.99)"
    ),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  streetAddress: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(3, "city must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

export const insertOrderSchema = z.object({
  userId: z.string(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string(),
  paymentResult: paymentResultSchema.optional(),
  itemsPrice: z.number().positive(),
  shippingPrice: z.number().positive(),
  taxPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  isPaid: z.boolean().optional(),
  paidAt: z.date().optional(),
  isDelivered: z.boolean().optional(),
  deliveredAt: z.date().optional(),
  createdAt: z.date().optional(),
});

// Insert Order Item Schema
export const insertOrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  qty: z.number().int().positive(),
  price: z.number().positive(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
});
