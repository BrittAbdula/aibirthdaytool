// next-auth.d.ts
import NextAuth from "next-auth"
import { PlanType } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      plan?: PlanType
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    plan?: PlanType
  }
} 