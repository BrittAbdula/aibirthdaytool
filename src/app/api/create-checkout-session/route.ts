import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Using recommended stable version instead of the hardcoded preview version
  apiVersion: "2023-10-16", 
})


export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const customer_email = session.user.email
    // const userId = "cm56ic66y000110jijyw2ir8r"
    // const customer_email = "auroroa@gmail.com"
    const { plan, returnUrl } = await request.json()
    
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return NextResponse.json(
        { error: "Invalid plan selected" }, 
        { status: 400 }
      )
    }

    // Get base URL for success and cancel URLs
    const origin = request.headers.get("origin") || "http://localhost:3000"
    
    // Set price ID based on the selected plan
    const priceId = plan === "monthly" 
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID
    
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured for the selected plan" },
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
        },
      },
      success_url: `${origin}${returnUrl || '/'}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?status=cancelled`,
      metadata: {
        userId,
        plan,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 