import React from "react";
import { Metadata } from "next";
import { auth } from "@/auth";
import { getUserById } from "@/lib/action/user.action";
import { APP_NAME } from "@/lib/constant";
import PaymentMethodForm from "./payment-method-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Payment method - ${APP_NAME}`,
};
const PaymentMethodPage = async () => {
  const session = await auth();
  if (!session) redirect("/");
  const user = await getUserById(session?.user?.id!);
  return <PaymentMethodForm preferredPaymentMethod={user?.paymentMethod!} />;
};

export default PaymentMethodPage;
