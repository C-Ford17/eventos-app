// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      tipo_usuario?: string
    } & DefaultSession["user"]
  }
  interface User {
    id?: string
    tipo_usuario?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    tipo_usuario?: string
  }
}
