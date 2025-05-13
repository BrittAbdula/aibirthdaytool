import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { PlanType } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [Google],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.id = user.id
      }
      
      // Fetch user plan from database if token has user id
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true }
        })
        if (dbUser) {
          token.plan = dbUser.plan
        }
      }
      
      return token
    },
    session({session, token}) {
      session.user.id = token.id as string;
      session.user.plan = token.plan as PlanType | undefined;
      return session
    },
  }
})