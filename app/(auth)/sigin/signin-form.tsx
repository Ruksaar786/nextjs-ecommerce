"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signInWithCredentials } from "./login-action";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schema/loginSchema";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get the callbackUrl from the query parameters
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  // 1. Define your form.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const validationFields = loginSchema.safeParse(values);
    if (!validationFields.success) {
      return { error: "Invalid fields!" };
    }
    const { email, password } = validationFields.data;

    const res = await signInWithCredentials({ email, password }, callbackUrl);
    if (res?.success) {
      toast.success("Login success");
      router.replace(callbackUrl);
    } else {
      toast.error(res?.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your Password"
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4">
          <Button type="submit">Login</Button>

          <Button variant="link">
            <Link href="/signup">
              Dont&#39;s have account go to Register Page.
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
