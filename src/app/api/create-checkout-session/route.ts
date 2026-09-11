import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Stripe from "stripe"
import { buildCheckoutRedirectUrls, getCheckoutQuantity } from "@/lib/pricing/checkout"
import { SKUS, getStripePriceId, isSkuKey } from "@/lib/pricing/plans"
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
  let sku: string | null = null
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
    const body = await request.json()
    sku = body.sku
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
      plan: isSkuKey(sku) ? sku : null,
      source,
      path: returnUrl,
      metadata: { ...checkoutMetadata, ...(isSkuKey(sku) ? {} : { requestedSku: String(sku) }) },
    })

    if (!isSkuKey(sku)) {
      await recordMonetizationEvent({
        eventType: "checkout_session_create_failed",
        userId,
        source,
        path: returnUrl,
        metadata: checkoutMetadata,
        errorCode: "invalid_sku",
        errorMessage: "Unknown SKU requested",
      })
      return NextResponse.json(
        { error: "Invalid plan selected", code: "invalid_sku" },
        { status: 400 }
      )
    }

    const quantity = getCheckoutQuantity(sku, body.quantity)
    if (quantity === null) {
      return NextResponse.json(
        { error: "Choose a whole number of packs from 1 to 99", code: "invalid_quantity" },
        { status: 400 }
      )
    }

    const selectedSku = SKUS[sku]

    let priceId: string
    try {
      priceId = getStripePriceId(sku)
    } catch (error) {
      await recordMonetizationEvent({
        eventType: "checkout_session_create_failed",
        userId,
        plan: sku,
        source,
        path: returnUrl,
        metadata: checkoutMetadata,
        errorCode: "missing_price_id",
        errorMessage: error instanceof Error ? error.message : "Price ID not configured",
      })
      return NextResponse.json(
        { error: "Price ID not configured for the selected plan", code: "missing_price_id" },
        { status: 500 }
      )
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"
    const { successUrl, cancelUrl } = buildCheckoutRedirectUrls(origin, returnUrl)

    // The webhook resolves what to grant from priceId, so it travels with the
    // session rather than being re-derived from an expanded line item later.
    const metadata = {
      userId,
      sku,
      priceId,
      quantity: String(quantity),
      source,
      country,
      device,
      ...(taskSize ? { taskSize: String(taskSize) } : {}),
    }

    const isPack = selectedSku.kind === "pack"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: customer_email || undefined,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity }],
      mode: isPack ? "payment" : "subscription",
      allow_promotion_codes: true,
      ...(isPack
        ? { payment_intent_data: { metadata } }
        : { subscription_data: { metadata } }),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })

    await recordMonetizationEvent({
      eventType: "checkout_session_created",
      userId,
      plan: sku,
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
      plan: isSkuKey(sku) ? sku : null,
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
