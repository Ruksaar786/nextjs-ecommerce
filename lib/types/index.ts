import { cartItemSchema } from "../validation/validator";
import { shippingAddressSchema } from "../validation/validator";
import { z } from "zod";

//CART

export type CartItem = z.infer<typeof cartItemSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
