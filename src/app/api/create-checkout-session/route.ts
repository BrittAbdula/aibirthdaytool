import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"
import { buildCheckoutRedirectUrls } from "@/lib/pricing"
import { recordMonetizationEvent } from "@/lib/monetization"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Using recommended stable version instead of the hardcoded preview version
  apiVersion: "2026-02-25.clover",
})


export async function POST(request: Request) {
  let userId: string | null = null
  let plan: string | null = null
  let source = "unknown"
  let returnUrl: string | null = null

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

    await recordMonetizationEvent({
      eventType: "checkout_session_create_attempt",
      userId,
      plan,
      source,
      path: returnUrl,
    })
    
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      await recordMonetizationEvent({
        eventType: "checkout_session_create_failed",
        userId,
        plan,
        source,
        path: returnUrl,
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
      payment_method_types: ["card"],
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
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
        source,
      },
    })

    await recordMonetizationEvent({
      eventType: "checkout_session_created",
      userId,
      plan,
      source,
      path: returnUrl,
      stripeSessionId: checkoutSession.id,
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
      errorCode: "checkout_session_error",
      errorMessage: error instanceof Error ? error.message : "Something went wrong",
    })
    return NextResponse.json(
      { error: "Something went wrong", code: "checkout_session_error" },
      { status: 500 }
    )
  }
}
