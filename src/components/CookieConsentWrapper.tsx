'use client';

import { useState } from 'react';
import { CookieConsent } from "@/components/CookieConsent";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCookieConsent, CookieConsent as ConsentType } from '@/hooks/use-cookie-consent';
import { toast } from '@/hooks/use-toast';

export function CookieConsentWrapper() {
  const { consent, updateConsent } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);
  const [tempConsent, setTempConsent] = useState<ConsentType>(consent);

  // 需要复制 CookieConsent 组件中的部分功能，但只展示设置对话框
  const openPreferences = () => {
    setTempConsent(consent);
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    updateConsent(tempConsent);
    setShowPreferences(false);
    toast({ description: "Cookie preferences saved" });
  };

  return (
    <>
      {/* Cookie Consent 组件本身 */}
      <CookieConsent />

      {/* Cookie 设置按钮 - 在所有页面显示 */}
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
  );
} 