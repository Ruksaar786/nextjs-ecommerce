import { getMyCart } from "@/lib/action/cart.actions";
import CartForm from "./cart-form";
import { Cart } from "@prisma/client";
import { CartItem } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
export const metadata = {
  title: `Shopping Cart - ${APP_NAME}`,
};

type CartType = Omit<Cart, "items"> & { items: CartItem[] };

const CartPage = async () => {
  const cart = await getMyCart();
  if (!cart) {
    return <p>Page not found</p>;
  }

  const parsedCart: CartType = {
    ...cart,
    items: cart.items,
  };
  return <CartForm cart={parsedCart} />;
};

export default CartPage;
