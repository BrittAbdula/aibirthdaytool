import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Using recommended stable version instead of the hardcoded preview version
  apiVersion: "2023-10-16", 
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") || ""

    if (!signature || !webhookSecret) {
      return new NextResponse("Webhook signature or secret missing", { status: 400 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error("Webhook signature verification failed:", error)
      return new NextResponse("Webhook signature verification failed", { status: 400 })
    }

    // Log the event to database for auditing
    await logStripeEvent(event)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new NextResponse("Webhook received", { status: 200 })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return new NextResponse("Error handling webhook", { status: 500 })
  }
}

// Log Stripe events to database
async function logStripeEvent(event: Stripe.Event) {
  try {
    const eventData = event.data.object as Record<string, any>
    let userId: string | null = null
    let amount: number | null = null
    let currency: string | null = null
    let status: string | null = null
    let paymentMethod: string | null = null
    let log: boolean = false

    // Extract user ID based on event type
    if (event.type === "checkout.session.completed") {
      const session = eventData as Stripe.Checkout.Session
      userId = session.client_reference_id || null
      status = session.status || null
      amount = session.amount_total || null
      currency = session.currency || null
      paymentMethod = session.payment_method_types?.[0] || null
      log = true
    } 
    else if (event.type.startsWith("customer.subscription")) {
      const subscription = eventData as Stripe.Subscription
      userId = subscription.metadata?.userId || null
      status = subscription.status || null
      amount = subscription.items.data[0]?.price.unit_amount || null
      currency = subscription.items.data[0]?.price.currency || null
      log = true
    }
    else if (event.type === "invoice.payment_succeeded") {
      const invoice = eventData as Stripe.Invoice
      userId = invoice.metadata?.userId || null
      status = invoice.status || null
      amount = invoice.amount_paid || null
      currency = invoice.currency || null
      log = true
    }

    if (log) {
      // Create log entry
      // @ts-ignore - Model might not be in the TypeScript types yet
      await prisma.stripeLog.create({
        data: {
          eventId: event.id,
        eventType: event.type,
        objectId: eventData.id || "",
        objectType: eventData.object,
        userId,
        amount,
        currency,
        status,
        paymentMethod,
        description: `${event.type} - ${eventData.id}`,
        metadata: eventData.metadata || {},
        rawData: eventData,
        },
      })
    }
  } catch (error) {
    console.error("Error logging Stripe event:", error)
    // Don't throw here, so main webhook handling continues even if logging fails
  }
}

// Handle successful checkout completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return

  const userId = session.client_reference_id
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error("No user ID in session metadata")
    return
  }

  // Get the subscription details with expanded price data
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  await updateSubscriptionInDatabase(userId, subscription)
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId as string | undefined

  if (!userId) {
    console.error("No user ID in subscription metadata")
    return
  }

  // Retrieve full subscription details with expanded price data
  const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
    expand: ['items.data.price'],
  })

  await updateSubscriptionInDatabase(userId, fullSubscription)
}

// Handle subscription deletions
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId as string | undefined

  if (!userId) {
    console.error("No user ID in subscription metadata")
    return
  }

  try {
    // Find the subscription in the database
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!existingSubscription) {
      console.error(`No subscription found for user ${userId}`)
      return
    }

    // Subscription periods are in Unix timestamp seconds
    // Use type assertion as the Stripe types might not fully match the actual API response
    const endTimestamp = (subscription as any).current_period_end
    const endDate = endTimestamp ? new Date(endTimestamp * 1000) : new Date()

    // Update subscription status to cancelled
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: "canceled",
        cancelAtPeriodEnd: true,
        endDate,
      },
    })

    // Update user plan to FREE
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE" },
    })
  } catch (error) {
    console.error("Error updating cancelled subscription:", error)
    throw error
  }
}

// Handle invoice payments (renewals)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Use type assertion as the Stripe types might not fully match the actual API response
  const subscriptionId = (invoice as any).subscription as string
  
  if (!subscriptionId) return

  // Retrieve full subscription details with expanded price data
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })
  
  const userId = subscription.metadata?.userId as string | undefined

  if (!userId) {
    console.error("No user ID in subscription metadata")
    return
  }

  await updateSubscriptionInDatabase(userId, subscription)
}

// Helper function to update subscription in database
async function updateSubscriptionInDatabase(userId: string, subscription: Stripe.Subscription) {
  try {
    // Safely retrieve price ID from subscription
    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
      console.error("No price ID found in subscription")
      return
    }

    const isMonthly = priceId === process.env.STRIPE_MONTHLY_PRICE_ID
    const isYearly = priceId === process.env.STRIPE_YEARLY_PRICE_ID

    if (!isMonthly && !isYearly) {
      console.error(`Unknown price ID: ${priceId}`)
      return
    }

    // Assuming you have enum types defined in Prisma schema
    const planType = "PREMIUM" 
    const billingPeriod = isMonthly ? "MONTHLY" : "YEARLY"
    
    // Subscription periods are in Unix timestamp seconds
    // Use type assertion as the Stripe types might not fully match the actual API response
    const startTimestamp = (subscription as any).current_period_start
    const endTimestamp = (subscription as any).current_period_end
    
    const startDate = startTimestamp ? new Date(startTimestamp * 1000) : new Date()
    const endDate = endTimestamp 
      ? new Date(endTimestamp * 1000) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days if missing
    
    const status = subscription.status

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    // Update or create subscription
    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: planType,
          billingPeriod,
          startDate,
          endDate,
          status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          lastBilledAt: new Date(),
          nextBillingAt: endDate,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          plan: planType,
          billingPeriod,
          startDate,
          endDate,
          status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          lastBilledAt: new Date(),
          nextBillingAt: endDate,
        },
      })
    }

    // Update the user's plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: planType },
    })
  } catch (error) {
    console.error("Error updating subscription in database:", error)
    throw error
  }
} 