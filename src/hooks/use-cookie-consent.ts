'use client'

import { useState, useEffect } from 'react'

export type CookieConsent = {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  targeting: boolean;
  timestamp: number;
}

// Default to accept all cookies
const defaultConsent: CookieConsent = {
  essential: true, // Essential cookies are always required
  performance: true, // Accept performance cookies by default
  functional: true, // Accept functional cookies by default
  targeting: true, // Accept targeting cookies by default
  timestamp: 0
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem('cookie-consent')
      if (storedConsent) {
        setConsent(JSON.parse(storedConsent))
      } else {
        // If no stored consent, use default (accept all) and save it
        localStorage.setItem('cookie-consent', JSON.stringify(defaultConsent))
        applyConsentSettings(defaultConsent)
      }
    } catch (error) {
      console.error('Failed to load cookie consent from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = {
      ...consent,
      ...newConsent,
      timestamp: Date.now()
    }
    
    setConsent(updatedConsent)
    localStorage.setItem('cookie-consent', JSON.stringify(updatedConsent))
    
    // Apply consent settings
    applyConsentSettings(updatedConsent)
    
    return updatedConsent
  }

  const resetConsent = () => {
    localStorage.removeItem('cookie-consent')
    setConsent(defaultConsent)
  }

  const applyConsentSettings = (consentSettings: CookieConsent) => {
    // Implementation for applying consent settings
    // This could include enabling/disabling various tracking scripts
    
    // Example: Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consentSettings.performance ? 'granted' : 'denied',
        ad_storage: consentSettings.targeting ? 'granted' : 'denied',
        functionality_storage: consentSettings.functional ? 'granted' : 'denied'
      })
    }
  }

  return {
    consent,
    isLoaded,
    updateConsent,
    resetConsent
  }
} 