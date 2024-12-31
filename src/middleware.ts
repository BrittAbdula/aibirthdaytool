import { auth } from "@/auth"

export const config = {
  matcher: [
    // '/my-cards/:path*'
  ]
}

export default auth((req) => {
  const { nextUrl } = req
  const isAuth = !!req.auth

  if (!isAuth) {
    return Response.redirect(new URL('/api/auth/signin', nextUrl))
  }
})
