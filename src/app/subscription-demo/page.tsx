import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionButton } from '@/components/SubscriptionModal'
import { PremiumButton } from '@/components/PremiumModal'
import { Crown, User, Calendar, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SubscriptionDemoPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Subscription Management Demo</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your subscription status.</p>
          <PremiumButton />
        </div>
      </div>
    )
  }

  // 获取用户订阅信息
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true }
  })

  const subscription = user?.subscription
  const isPremiumUser = user?.plan === "PREMIUM"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Subscription Management Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Plan:</span>
                {isPremiumUser ? (
                  <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline">Free</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                        {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Billing:</span>
                      <span className="text-sm font-medium">
                        {subscription.billingPeriod || 'Monthly'}
                      </span>
                    </div>
                    
                    {subscription.endDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Next billing:</span>
                        <span className="text-sm font-medium">
                          {subscription.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {subscription.cancelAtPeriodEnd && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          Your subscription will end on {subscription.endDate?.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No active subscription</p>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Subscription Actions</CardTitle>
              <CardDescription>
                Manage your subscription settings and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                {isPremiumUser ? (
                  <>
                    <SubscriptionButton />
                    <div className="text-sm text-gray-500 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      ✅ You have access to all premium features
                    </div>
                  </>
                ) : (
                  <>
                    <PremiumButton />
                    <div className="text-sm text-gray-500 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      Upgrade to Premium for unlimited access
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feature Comparison */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Free Plan</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      5 cards with basic model
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Includes watermark
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Public sharing only
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-purple-700 flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Premium Plan
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      500 cards with basic model
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      250 cards with premium model
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      No watermarks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Private sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Ad-free experience
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 