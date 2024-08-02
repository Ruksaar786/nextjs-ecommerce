import type {NextAuthConfig} from "next-auth"
import credentials from "next-auth/providers/credentials"
import { loginSchema } from "./lib/schema/loginSchema"
import { getUserByEmail } from "./lib/action/user.action"
import bcrypt from "bcryptjs";

export default {
    providers: [
        credentials({
            async authorize(credentials){
                if(!credentials){
                    throw new Error("No credentials provided")
                }
                const validatedFields = loginSchema.safeParse(credentials);
            }
        })
    ]
}