import { APP_NAME } from "@/lib/constant";
import { Metadata } from "next";
import { getMyCart } from "@/lib/action/cart.actions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/action/user.action";

import ShippingAddressForm from "./shipping-address-form";

export const metadata: Metadata = {
  title: `Shipping Address - ${APP_NAME}`,
};

export default async function ShippingPage() {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();
  const user = await getUserById(session?.user?.id!);

  // Ensure user.Address exists and take the first address if it's an array
  const address = Array.isArray(user?.address)
    ? user.address[0]
    : user?.address || null;
  return <ShippingAddressForm address={address} />;
}
