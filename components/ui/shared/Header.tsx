import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../button";
import { ShoppingCart, User2Icon, UserIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/">
            <Image
              src="/icons/logo.svg"
              alt="ecommerce logo"
              width={50}
              height={50}
            />
          </Link>
        </div>
        <div className="space-x-2">
          <Button asChild variant="ghost">
            <Link href="/cart">
              <ShoppingCart />
              Cart
            </Link>
          </Button>

          <Button asChild>
            <Link href="/singin">
              <UserIcon />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
