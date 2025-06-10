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

// Default to accept all cookies
const defaultConsent: CookieConsent = {
  essential: true,
  performance: true,
  functional: true,
  targeting: true,
  timestamp: 0
}

export function CookieConsent() {
  const { consent, updateConsent } = useCookieConsent()
  const [showPreferences, setShowPreferences] = useState(false)
  const [tempConsent, setTempConsent] = useState<ConsentType>(consent)

  // Auto-accept all cookies on first visit
  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent')
    if (!storedConsent) {
      // Auto-accept all cookies for new users
      const autoAcceptConsent = updateConsent({
        essential: true,
        performance: true,
        functional: true,
        targeting: true
      })
      
      // Call gtag consent update
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': 'granted',
          'analytics_storage': 'granted',
          'functionality_storage': 'granted',
          'personalization_storage': 'granted',
        });
      }
    }
  }, [updateConsent])

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
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied',
      });
    }
    setShowPreferences(false)
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
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied',
      });
    }
    setShowPreferences(false)
    toast({ description: "Only essential cookies accepted" })
  }

  // Open preferences dialog
  const openPreferences = () => {
    setTempConsent(consent); // Sync temp consent with current global consent
    setShowPreferences(true);
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
        'personalization_storage': updatedConsent.functional ? 'granted' : 'denied',
      });
    }
    setShowPreferences(false);
    toast({ description: "Cookie preferences saved" });
  };

  return (
    <>
      {/* Cookie Settings Button - positioned in bottom left */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openPreferences}
          className="text-xs bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200 hover:shadow-xl transition-all duration-200"
        >
          🍪 Cookie Settings
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
                id="essential"
                checked={true}
                disabled={true}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="essential" className="text-sm font-medium">
                  Essential Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Required for basic website functionality. Cannot be disabled.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="performance"
                checked={tempConsent.performance}
                onCheckedChange={(checked) => setTempConsent(prev => ({ ...prev, performance: !!checked }))}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="performance" className="text-sm font-medium">
                  Performance Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Help us analyze website usage and improve performance.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="functional"
                checked={tempConsent.functional}
                onCheckedChange={(checked) => setTempConsent(prev => ({ ...prev, functional: !!checked }))}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="functional" className="text-sm font-medium">
                  Functional Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="targeting"
                checked={tempConsent.targeting}
                onCheckedChange={(checked) => setTempConsent(prev => ({ ...prev, targeting: !!checked }))}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="targeting" className="text-sm font-medium">
                  Targeting Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Used to deliver personalized advertisements.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground py-2">
            <p>
              Read our{' '}
              <a href="/privacy-policy" className="text-pink-500 hover:underline">
                privacy policy
              </a>{' '}
              to learn more about how we use cookies.
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleAcceptEssential}
              className="sm:order-first"
            >
              Essential Only
            </Button>
            <Button 
              onClick={handleAcceptAll}
              className="bg-pink-500 hover:bg-pink-600 text-white sm:order-2"
            >
              Accept All
            </Button>
            <Button 
              onClick={handleSavePreferences}
              variant="outline"
              className="sm:order-3"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 