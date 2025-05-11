"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Crown, Check, CreditCard, X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PremiumPlanProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PremiumModal({ isOpen, onOpenChange }: PremiumPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    try {
      setIsLoading(true)
      
      // Call API to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      // Redirect to Stripe checkout page
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setIsLoading(false)
    }
  }

  // Comparison table data
  const comparisonData = [
    { feature: "Credits", free: "0", premium: "500/month" },
    { feature: "Generate card by basic Model", free: "5 cards", premium: "500 cards" },
    { feature: "Generate card by Premium Model", free: "Not available", premium: "250 cards" },
    { feature: "Multi-generation", free: "1", premium: "2" },
    { feature: "Edit and send cards by Templates", free: "Unlimited", premium: "Unlimited" },
    { feature: "Download your cards", free: "Yes", premium: "Yes" },
    { feature: "Custom URL expiration", free: "Can be replaced anytime", premium: "30 days (not replaceable)" },
    { feature: "Privacy mode", free: "Public", premium: "Private" },
    { feature: "Watermark", free: "Includes watermark", premium: "No watermarks" },
    { feature: "Advertisements", free: "Yes", premium: "No" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[900px] p-0 overflow-hidden rounded-xl border-0 md:border md:border-gray-200">
        <div className="flex flex-col md:flex-row relative overflow-hidden">
          {/* Left side - Plan comparison (PC) / Bottom (Mobile) */}
          <div className="w-full md:w-3/5 bg-white p-6 overflow-auto max-h-[80vh] md:max-h-none order-2 md:order-1 border-t border-gray-100 md:border-t-0">
            <DialogHeader className="mb-4 hidden md:block">
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Free vs Premium
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-gray-500 font-medium border-b"></th>
                    <th className="p-2 text-center text-gray-700 font-bold border-b">Free</th>
                    <th className="p-2 text-center text-purple-600 font-bold border-b">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-2 border-b text-gray-700 font-medium">{row.feature}</td>
                      <td className="p-2 border-b text-center">
                        {row.free === "Yes" ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : row.free === "Not available" ? (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        ) : (
                          <span className={row.free === "Free" ? "text-gray-600 font-semibold" : "text-gray-600"}>
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="p-2 border-b text-center">
                        {row.premium === "Yes" ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : row.premium === "No" ? (
                          <X className="h-5 w-5 text-red-400 mx-auto" />
                        ) : (
                          <span className="text-purple-700 font-semibold">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Right side (PC) / Top (Mobile) - Pricing options */}
          <div className="w-full md:w-2/5 bg-gradient-to-r from-purple-50 to-pink-50 p-6 md:border-l border-gray-100 flex flex-col order-1 md:order-2">
            {/* Mobile title that shows both */}
            <div className="block md:hidden mb-4">
              <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
                Go Premium
              </DialogTitle>
            </div>
            
            {/* Payment options - shown at the top */}
            <div>
              {/* Only show this title on desktop */}
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-4 hidden md:block">
                Go Premium
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-gray-700"><span className="font-semibold">500 cards</span> with basic model, <span className="font-semibold">100x</span> more than free</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-gray-700">Exclusive <span className="font-semibold">Premium Model</span> with <span className="font-semibold">250 cards</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-gray-700"><span className="font-semibold">No watermarks + Ad-free</span> for professional sharing</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-amber-500 flex">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 font-medium">4.8/5</span>
                <span className="text-sm text-gray-500">(844 reviews)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Yearly plan (most popular) */}
                <div 
                  className={cn(
                    "relative border-2 rounded-xl p-3 cursor-pointer transition-all",
                    selectedPlan === "yearly" 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300"
                  )}
                  onClick={() => setSelectedPlan("yearly")}
                >
                  {/* Most popular tag */}
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-2 py-0.5 rounded-bl-xl rounded-tr-xl font-medium text-xs transform translate-y-[-1px] translate-x-[1px]">
                    Most popular
                  </div>
                  
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedPlan === "yearly" 
                          ? "border-purple-500 bg-purple-500" 
                          : "border-gray-300"
                      )}>
                        {selectedPlan === "yearly" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">Yearly</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">$52.99<span className="text-green-500 text-xs ml-1">(-36%)</span></div>
                      <div className="text-xs text-gray-500">$4.42/month</div>
                    </div>
                  </div>
                </div>
                
                {/* Monthly plan */}
                <div 
                  className={cn(
                    "border-2 rounded-xl p-3 cursor-pointer transition-all",
                    selectedPlan === "monthly" 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300"
                  )}
                  onClick={() => setSelectedPlan("monthly")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedPlan === "monthly" 
                          ? "border-purple-500 bg-purple-500" 
                          : "border-gray-300"
                      )}>
                        {selectedPlan === "monthly" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">$6.99</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                className="w-full mt-4 mb-2 bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-lg font-medium"
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PremiumButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-1 text-white bg-purple-600 hover:bg-purple-700 border-purple-600"
      >
        <Crown className="h-4 w-4" />
        <span>Premium</span>
      </Button>
      <PremiumModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  )
} 