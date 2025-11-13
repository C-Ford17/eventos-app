// src/app/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { SessionStrategy } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Busca el usuario en la base de datos
        const user = await prisma.usuario.findUnique({
          where: { email: credentials?.email }
        })
        if (!user) return null;
        // Verifica el password
        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) return null;
        // Retorna el usuario sin el password
        return { id: user.id, name: user.nombre, email: user.email, tipo_usuario: user.tipo_usuario };
      }
    })
  ],
  session: { strategy: "jwt" as SessionStrategy },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // SOLO en el primer login, 'user' tiene valor
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.tipo_usuario = user.tipo_usuario;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfiere los campos del token a session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tipo_usuario = token.tipo_usuario as string;
        // Agrega otros campos si lo necesitas
      }
      return session;
    },
  },
};

export default authOptions;
