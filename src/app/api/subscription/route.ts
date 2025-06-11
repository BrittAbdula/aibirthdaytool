import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-ignore - Using recommended stable version
  apiVersion: "2023-10-16", 
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 从数据库获取用户的订阅信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })
    
    if (!user?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const subscription = user.subscription

    return NextResponse.json({
      id: subscription.id.toString(),
      status: subscription.status,
      current_period_start: Math.floor(subscription.startDate.getTime() / 1000),
      current_period_end: subscription.endDate ? Math.floor(subscription.endDate.getTime() / 1000) : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Default to 30 days if no end date
      cancel_at_period_end: subscription.cancelAtPeriodEnd,
      canceled_at: null,
      plan: subscription.plan === 'PREMIUM' ? 'Premium' : 'Free',
      amount: subscription.billingPeriod === 'YEARLY' ? 5299 : 699, // In cents
      currency: 'usd',
      interval: subscription.billingPeriod?.toLowerCase() || 'month',
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 从数据库获取用户和关联的Stripe日志
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        subscription: true,
        stripeLogs: {
          where: {
            eventType: {
              in: ['customer.subscription.created', 'customer.subscription.updated']
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!user?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // 尝试从Stripe日志中找到实际的Stripe订阅ID
    let stripeSubscriptionId: string | null = null
    if (user.stripeLogs.length > 0) {
      const log = user.stripeLogs[0]
      stripeSubscriptionId = log.objectId
    }

    let updatedSubscription
    
    // 如果有Stripe订阅ID，则同时取消Stripe订阅
    if (stripeSubscriptionId) {
      try {
        // 在Stripe中取消订阅（在当前计费周期结束时）
        await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // 即使Stripe操作失败，也继续更新本地数据库
      }
    }

    // 更新本地数据库中的订阅状态
    updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: { 
        cancelAtPeriodEnd: true,
        status: 'canceling'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      subscription: {
        id: updatedSubscription.id.toString(),
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancelAtPeriodEnd,
        current_period_end: updatedSubscription.endDate ? Math.floor(updatedSubscription.endDate.getTime() / 1000) : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}

// 恢复订阅（如果在当前计费周期内取消了）
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action !== 'reactivate') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // 从数据库获取用户和关联的Stripe日志
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        subscription: true,
        stripeLogs: {
          where: {
            eventType: {
              in: ['customer.subscription.created', 'customer.subscription.updated']
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!user?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // 尝试从Stripe日志中找到实际的Stripe订阅ID
    let stripeSubscriptionId: string | null = null
    if (user.stripeLogs.length > 0) {
      const log = user.stripeLogs[0]
      stripeSubscriptionId = log.objectId
    }

    let updatedSubscription

    // 如果有Stripe订阅ID，则同时恢复Stripe订阅
    if (stripeSubscriptionId) {
      try {
        // 在Stripe中恢复订阅
        await stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: false,
        })
      } catch (stripeError) {
        console.error('Error reactivating Stripe subscription:', stripeError)
        // 即使Stripe操作失败，也继续更新本地数据库
      }
    }

    // 恢复本地数据库中的订阅
    updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: { 
        cancelAtPeriodEnd: false,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription has been reactivated',
      subscription: {
        id: updatedSubscription.id.toString(),
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancelAtPeriodEnd,
        current_period_end: updatedSubscription.endDate ? Math.floor(updatedSubscription.endDate.getTime() / 1000) : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json({ error: 'Failed to reactivate subscription' }, { status: 500 })
  }
} 