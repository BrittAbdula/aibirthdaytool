export const runtime = 'nodejs'

export function GET(request: Request) {
  return Response.redirect(new URL('/og-cover.jpg', request.url), 302)
}
