import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/action/cart.actions";
import { Cart } from "@prisma/client";
import { CartItem } from "@/lib/types";

type CartArray = Omit<Cart, "items"> & {
  items: CartItem[];
};

export default async function CartButton() {
  const cart = ((await getMyCart()) as CartArray) || null;
  console.log(cart);

  return (
    <Button asChild variant="ghost">
      <Link href="/cart">
        <ShoppingCart className="mr-1" />
        Cart
        {cart && cart.items.length > 0 && (
          <Badge className="ml-1">
            {cart.items.reduce((a, c) => a + c.qty, 0)}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
[];
