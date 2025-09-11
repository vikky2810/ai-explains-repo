import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword, createUser } from "@/lib/services/users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" }, // "login" or "register"
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const mode = (credentials?.mode as string) || "login";
        if (!email || !password) return null;

        if (mode === "register") {
          const existing = await findUserByEmail(email);
          if (existing && existing.password_hash) return null;
          const user = await createUser(email, password);
          return { id: user.id, email: user.email } as any;
        }

        const user = await findUserByEmail(email);
        if (!user || !user.password_hash) return null;
        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return null;
        return { id: user.id, email: user.email } as any;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
};


