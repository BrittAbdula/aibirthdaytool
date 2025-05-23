'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useCookieConsent, CookieConsent as ConsentType } from '@/hooks/use-cookie-consent'

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Cookie consent types
type CookieConsent = {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  targeting: boolean;
  timestamp: number;
}

const defaultConsent: CookieConsent = {
  essential: true, // Essential cookies are always required
  performance: false,
  functional: false,
  targeting: false,
  timestamp: 0
}

export function CookieConsent() {
  const { consent, updateConsent } = useCookieConsent()
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [tempConsent, setTempConsent] = useState<ConsentType>(consent)

  // Check if consent exists on component mount
  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent')
    if (!storedConsent) {
      setIsOpen(true)
    } else {
      try {
        const parsedConsent = JSON.parse(storedConsent)
        
        // Check if consent is older than 6 months (180 days)
        const sixMonthsInMs = 180 * 24 * 60 * 60 * 1000
        if (Date.now() - parsedConsent.timestamp > sixMonthsInMs) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Failed to parse stored consent:', error)
        setIsOpen(true)
      }
    }
  }, [])

  // Update tempConsent when consent changes
  useEffect(() => {
    setTempConsent(consent)
  }, [consent])

  const handleAcceptAll = () => {
    const updatedConsent = updateConsent({
      essential: true,
      performance: true,
      functional: true,
      targeting: true
    })
    // Call gtag consent update
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': updatedConsent.targeting ? 'granted' : 'denied',
        'analytics_storage': updatedConsent.performance ? 'granted' : 'denied',
        'functionality_storage': updatedConsent.functional ? 'granted' : 'denied',
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied', // Assuming functional implies personalization
      });
    }
    setIsOpen(false)
    toast({ description: "All cookies accepted" })
  }

  const handleAcceptEssential = () => {
    const updatedConsent = updateConsent({
      essential: true,
      performance: false,
      functional: false,
      targeting: false
    })
    // Call gtag consent update
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': updatedConsent.targeting ? 'granted' : 'denied',
        'analytics_storage': updatedConsent.performance ? 'granted' : 'denied',
        'functionality_storage': updatedConsent.functional ? 'granted' : 'denied',
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied', // Assuming functional implies personalization
      });
    }
    setIsOpen(false)
    toast({ description: "Only essential cookies accepted" })
  }

  // Open preferences dialog
  const openPreferences = () => {
    setTempConsent(consent); // Sync temp consent with current global consent
    setShowPreferences(true);
    setIsOpen(false); // Close initial dialog if open
  };

  // Save preferences from preferences dialog
  const handleSavePreferences = () => {
    const updatedConsent = updateConsent(tempConsent);
    // Call gtag consent update after saving preferences
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': updatedConsent.targeting ? 'granted' : 'denied',
        'analytics_storage': updatedConsent.performance ? 'granted' : 'denied',
        'functionality_storage': updatedConsent.functional ? 'granted' : 'denied',
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied', // Assuming functional implies personalization
      });
    }
    setShowPreferences(false);
    toast({ description: "Cookie preferences saved" });
  };

  return (
    <>
      {/* Main Cookie Consent Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Cookie Consent</DialogTitle>
            <DialogDescription>
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm text-muted-foreground">
            <p>
              This website uses cookies to ensure you get the best experience on our website. Read our{' '}
              <a href="/privacy-policy" className="text-pink-500 hover:underline">
                privacy policy
              </a>{' '}
              to learn more.
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={openPreferences}
              className="sm:order-first"
            >
              Preferences
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAcceptEssential}
              className="sm:order-2"
            >
              Essential Only
            </Button>
            <Button 
              onClick={handleAcceptAll}
              className="bg-pink-500 hover:bg-pink-600 text-white sm:order-3"
            >
              Accept All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cookie Settings Button - always visible */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openPreferences}
          className="text-xs bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
        >
          Cookie Settings
        </Button>
      </div>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
            <DialogDescription>
              Customize your cookie preferences. Essential cookies cannot be disabled as they are required for the website to function properly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox 
                id="essential-settings" 
                checked={tempConsent.essential} 
                disabled 
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="essential-settings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Essential Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are necessary for the website to function and cannot be disabled.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox 
                id="performance-settings" 
                checked={tempConsent.performance}
                onCheckedChange={(checked) => 
                  setTempConsent({...tempConsent, performance: checked === true})
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="performance-settings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Performance Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with our website, helping us improve our site and services.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox 
                id="functional-settings" 
                checked={tempConsent.functional}
                onCheckedChange={(checked) => 
                  setTempConsent({...tempConsent, functional: checked === true})
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="functional-settings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies enable website functionality, such as saving your preferences and providing personalized features.
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox 
                id="targeting-settings" 
                checked={tempConsent.targeting}
                onCheckedChange={(checked) => 
                  setTempConsent({...tempConsent, targeting: checked === true})
                }
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="targeting-settings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Targeting Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are used to deliver personalized ads and content based on your interests.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSavePreferences}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 