"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, CreditCard, AlertTriangle, CheckCircle, Loader2, Crown, X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface SubscriptionData {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at: number | null
  plan: string
  amount: number
  currency: string
  interval: string
}

interface SubscriptionModalProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SubscriptionModal({ isOpen, onOpenChange }: SubscriptionModalProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  // 获取订阅详情
  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/subscription')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription')
      }
      
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription')
    } finally {
      setIsLoading(false)
    }
  }

  // 取消订阅
  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    try {
      setIsActionLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      const response = await fetch('/api/subscription', {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
      
      setSuccessMessage(data.message)
      // 重新获取订阅信息
      await fetchSubscription()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setIsActionLoading(false)
    }
  }

  // 恢复订阅
  const handleReactivateSubscription = async () => {
    if (!subscription) return
    
    try {
      setIsActionLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reactivate' }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription')
      }
      
      setSuccessMessage(data.message)
      // 重新获取订阅信息
      await fetchSubscription()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      setError(error instanceof Error ? error.message : 'Failed to reactivate subscription')
    } finally {
      setIsActionLoading(false)
    }
  }

  // 当模态框打开时获取订阅信息
  useEffect(() => {
    if (isOpen) {
      fetchSubscription()
    }
  }, [isOpen])

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 格式化价格
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  // 获取状态显示
  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">Canceling</Badge>
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Active</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge variant="outline" className="text-red-600 border-red-300">Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Manage Subscription
          </DialogTitle>
          <DialogDescription>
            View and manage your premium subscription
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : subscription ? (
          <div className="space-y-6">
            {/* 成功消息 */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* 订阅状态 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.plan} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  {formatPrice(subscription.amount, subscription.currency)} / {subscription.interval}
                </p>
              </div>
              {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
            </div>

            <Separator />

            {/* 订阅详情 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Current period</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next billing date</p>
                  <p className="text-sm text-gray-600">
                    {subscription.cancel_at_period_end 
                      ? 'Subscription will end on ' + formatDate(subscription.current_period_end)
                      : formatDate(subscription.current_period_end)
                    }
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 操作按钮 */}
            <div className="space-y-3">
              {subscription.cancel_at_period_end ? (
                <div className="space-y-3">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Your subscription is scheduled to cancel at the end of the current billing period. 
                      You will continue to have access to premium features until {formatDate(subscription.current_period_end)}.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={isActionLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Reactivate Subscription'
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={isActionLoading}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
              
              <p className="text-xs text-gray-500 text-center">
                Canceling will stop your subscription at the end of the current billing period. 
                You won't be charged for the next period.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No subscription found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function SubscriptionButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
      >
        <Crown className="h-4 w-4" />
        <span>Manage</span>
      </Button>
      <SubscriptionModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
} 