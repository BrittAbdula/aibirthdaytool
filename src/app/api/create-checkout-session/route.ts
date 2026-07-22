import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"
import { buildCheckoutRedirectUrls } from "@/lib/pricing"
import { recordMonetizationEvent } from "@/lib/monetization"
import { getCreatorDevice } from "@/lib/creator-pro"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Using recommended stable version instead of the hardcoded preview version
  apiVersion: "2026-02-25.clover",
  // OpenNext bundles the Node entrypoint, whose default Node HTTP transport can
  // hang under workerd. Stripe's fetch transport uses the Workers-native API.
  httpClient: Stripe.createFetchHttpClient(),
  timeout: 20_000,
})


export async function POST(request: Request) {
  let userId: string | null = null
  let plan: string | null = null
  let source = "unknown"
  let returnUrl: string | null = null
  let taskSize: number | null = null
  let country = "ZZ"
  let device: ReturnType<typeof getCreatorDevice> = "unknown"

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    userId = session.user.id
    const customer_email = session.user.email
    // const userId = "cm56ic66y000110jijyw2ir8r"
    // const customer_email = "auroroa@gmail.com"
    const body = await request.json()
    plan = body.plan
    returnUrl = body.returnUrl
    source = typeof body.source === "string" ? body.source : "unknown"
    taskSize = typeof body.taskSize === "number" && Number.isFinite(body.taskSize)
      ? Math.max(1, Math.min(50, Math.floor(body.taskSize)))
      : null
    const countryHeader = (request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "")
      .trim()
      .toUpperCase()
    country = /^[A-Z]{2}$/.test(countryHeader) ? countryHeader : "ZZ"
    device = getCreatorDevice(request.headers.get("user-agent"))
    const checkoutMetadata = { country, device, ...(taskSize ? { taskSize } : {}) }

    await recordMonetizationEvent({
      eventType: "checkout_session_create_attempt",
      userId,
      plan,
      source,
      path: returnUrl,
      metadata: checkoutMetadata,
    })
    
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      await recordMonetizationEvent({
        eventType: "checkout_session_create_failed",
        userId,
        plan,
        source,
        path: returnUrl,
        metadata: checkoutMetadata,
        errorCode: "invalid_plan",
        errorMessage: "Invalid plan selected",
      })
      return NextResponse.json(
        { error: "Invalid plan selected", code: "invalid_plan" },
        { status: 400 }
      )
    }

    // Get base URL for success and cancel URLs
    const origin = request.headers.get("origin") || "http://localhost:3000"
    const { successUrl, cancelUrl } = buildCheckoutRedirectUrls(origin, returnUrl)
    
    // Set price ID based on the selected plan
    const priceId = plan === "monthly" 
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID
    
    if (!priceId) {
      await recordMonetizationEvent({
        eventType: "checkout_session_create_failed",
        userId,
        plan,
        source,
        path: returnUrl,
        metadata: checkoutMetadata,
        errorCode: "missing_price_id",
        errorMessage: "Price ID not configured for the selected plan",
      })
      return NextResponse.json(
        { error: "Price ID not configured for the selected plan", code: "missing_price_id" },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: customer_email || undefined,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
          source,
          country,
          device,
          ...(taskSize ? { taskSize: String(taskSize) } : {}),
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
        source,
        country,
        device,
        ...(taskSize ? { taskSize: String(taskSize) } : {}),
      },
    })

    await recordMonetizationEvent({
      eventType: "checkout_session_created",
      userId,
      plan,
      source,
      path: returnUrl,
      stripeSessionId: checkoutSession.id,
      metadata: checkoutMetadata,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    await recordMonetizationEvent({
      eventType: "checkout_session_create_failed",
      userId,
      plan,
      source,
      path: returnUrl,
      metadata: { country, device, ...(taskSize ? { taskSize } : {}) },
      errorCode: "checkout_session_error",
      errorMessage: error instanceof Error ? error.message : "Something went wrong",
    })
    return NextResponse.json(
      { error: "Something went wrong", code: "checkout_session_error" },
      { status: 500 }
    )
  }
}
