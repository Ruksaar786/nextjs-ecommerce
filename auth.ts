import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import prisma from "./prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user, session, trigger }: any) {
      if (user) {
        if (trigger === "signIn" || trigger === "signUp") {
          const sessionCartId = cookies().get("sessionCartId")?.value;
          if (!sessionCartId) throw new Error("Session cart not Found");

          const sessionCartExists = await prisma.cart.findFirst({
            where: {
              sessionCartId: sessionCartId,
            },
          });

          if (sessionCartExists && !sessionCartExists.userId) {
            const userCartExists = await prisma.cart.findFirst({
              where: {
                userId: user.id,
              },
            });
            if (userCartExists) {
              cookies().set("beforeSigninSessionCartId", sessionCartId);
              cookies().set("sessionCartId", userCartExists.sessionCartId);
            } else {
              await prisma.cart.update({
                where: { id: sessionCartExists.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (trigger === "update") {
        token.name = session.user.name;
      }
      return token;
    },

    session: async ({ session, user, trigger, token }: any) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },

    authorized({ request, auth }: any) {
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];
      const { pathname } = request.nextUrl;
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      const sessionCartId = request.cookies.get("sessionCartId");

      if (!sessionCartId) {
        const newSessionCartId = crypto.randomUUID();
        const newRequestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        response.cookies.set("sessionCartId", newSessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
