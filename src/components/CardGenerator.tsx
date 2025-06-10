'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageViewer } from '@/components/ImageViewer'
import { cn, fetchSvgContent } from '@/lib/utils'
import { CardType, CardConfig } from '@/lib/card-config'
import { useSession, signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import { CARD_SIZES } from '@/lib/card-config'
import { useCardGeneration } from '@/hooks/useCardGeneration'
import { AlertCircle, Info } from 'lucide-react'
import { PremiumModal } from '@/components/PremiumModal'

const MagicalCardCreation = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Floating sparkles with dance animation */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-sparkle-dance"
          style={{
            left: `${15 + (i * 8)}%`,
            top: `${20 + Math.sin(i) * 25}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          <span className="text-yellow-400 text-base drop-shadow-sm">✨</span>
        </div>
      ))}
      
      {/* Floating hearts with gentle movement */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`heart-${i}`}
          className="absolute animate-float-gentle"
          style={{
            left: `${25 + (i * 12)}%`,
            top: `${30 + Math.cos(i) * 20}%`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          <span className="text-pink-400 text-sm drop-shadow-sm">💕</span>
        </div>
      ))}
      
      {/* Magic creation canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-32 h-40 border-2 border-dashed border-pink-300 rounded-lg animate-magic-glow">
            <div className="absolute inset-3 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded opacity-60 animate-pulse"></div>
            
            {/* Card elements appearing */}
            <div className="absolute inset-4 flex flex-col justify-center items-center space-y-2">
              <div className="w-16 h-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-300 to-green-300 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
              <div className="w-14 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
          
          {/* Magic wand with wave animation */}
          <div className="absolute -top-6 -right-6 animate-wand-wave">
            <div className="w-10 h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full shadow-md"></div>
            <div className="absolute -top-0.5 -right-0.5 animate-sparkle-dance">
              <span className="text-yellow-300 text-xs">⭐</span>
            </div>
            {/* Magic trail */}
            <div className="absolute -left-8 top-0 w-8 h-0.5 bg-gradient-to-l from-yellow-300 to-transparent rounded animate-pulse opacity-60"></div>
          </div>
        </div>
      </div>
      
      {/* Magical particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full animate-float-gentle"
          style={{
            left: `${20 + (i * 8)}%`,
            top: `${35 + Math.sin(i * 1.5) * 20}%`,
            backgroundColor: ['#FFE4E1', '#E6E6FA', '#F0F8FF', '#F5FFFA', '#FFF8DC', '#F0FFF0', '#FFE4E1', '#E0FFFF'][i],
            animationDelay: `${i * 0.3}s`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}
      
      {/* Mystical circles with improved animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-48 h-48 border border-pink-200/40 rounded-full animate-spin opacity-20" style={{ animationDuration: '12s' }}></div>
        <div className="absolute w-36 h-36 border border-purple-200/50 rounded-full animate-spin opacity-25" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
        <div className="absolute w-24 h-24 border border-blue-200/60 rounded-full animate-spin opacity-30" style={{ animationDuration: '6s' }}></div>
      </div>
    </div>
  )
}

const AgeSelector = ({ age, setAge }: { age: number | null, setAge: (age: number | null) => void }) => {
  const handleSliderChange = (value: number[]) => {
    setAge(value[0] || null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value)
    if (value === null || (!isNaN(value) && value >= 0 && value <= 120)) {
      setAge(value)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <Slider
          id="age-slider"
          min={0}
          max={120}
          step={1}
          value={[age || 0]}
          onValueChange={handleSliderChange}
          className="flex-grow custom-slider text-base [&_[role=slider]]:bg-[#FFC0CB] [&_[role=slider]]:border-[#FFC0CB] [&_[role=slider]]:hover:bg-[#FFD1DC] [&_[role=track]]:bg-[#FFC0CB]"
        />
        <Input
          id="age-input"
          type="number"
          min={0}
          max={120}
          value={age === null ? '' : age}
          onChange={handleInputChange}
          className="w-16 text-center focus-visible:ring-[#FFC0CB] focus-visible:border-[#FFC0CB]"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>30</span>
        <span>60</span>
        <span>90</span>
        <span>120</span>
      </div>
    </div>
  )
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-300 rounded-full h-2.5">
    <div
      className="bg-[#FFC0CB] h-2.5 rounded-full"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const CustomSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  customValue,
  onCustomValueChange,
  required,
  label
}: {
  value: string,
  onValueChange: (value: string) => void,
  placeholder: string,
  options: string[],
  customValue: string,
  onCustomValueChange: (value: string) => void,
  required?: boolean,
  label: string
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomValueChange(e.target.value);
    onValueChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className={cn(
        "transition-all duration-300",
        isCustom ? "hidden" : "block"
      )}>
        <Select
          value={isCustom ? "" : value}
          onValueChange={(val) => {
            if (val === "custom") {
              setIsCustom(true);
            } else {
              onValueChange(val);
            }
          }}
          required={required && !isCustom}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" className="text-[#b19bff]">✨ Custom </SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        "transition-all duration-300",
        !isCustom ? "hidden" : "block"
      )}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={customValue}
            onChange={handleCustomValueChange}
            placeholder={`Enter custom ${label.toLowerCase()}`}
            className="pr-10 border-[#b19bff]"
            required={required && isCustom}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
            onClick={() => {
              setIsCustom(false);
              onCustomValueChange("");
              onValueChange("");
            }}
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CardGenerator({
  wishCardType,
  initialCardId,
  initialImgUrl,
  cardConfig
}: {
  wishCardType: CardType,
  initialCardId: string,
  initialImgUrl: string,
  cardConfig: CardConfig
}) {
  const { data: session, status } = useSession()
  const [usageCount, setUsageCount] = useState<number>(0)
  const [currentCardType, setCurrentCardType] = useState<CardType>(wishCardType)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [imageCount, setImageCount] = useState<number>(1)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const router = useRouter()
  const sampleCard = `/card/goodluck.svg`
  const [submited, setSubmited] = useState(false)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [selectedSize, setSelectedSize] = useState(cardConfig.defaultSize || 'portrait')
  const [cardRequirements, setCardRequirements] = useState<string>('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [errorToast, setErrorToast] = useState<{
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  } | null>(null);

  // Add ref to track if we're waiting for authentication
  const pendingAuthRef = useRef<boolean>(false)
  // Add state to store form data before authentication
  const [savedFormData, setSavedFormData] = useState<{
    formData: Record<string, any>,
    customValues: Record<string, string>,
    selectedSize: string,
    cardRequirements: string
  } | null>(null)

  // Use the card generation hook
  const {
    generateCards,
    imageStates,
    globalLoading,
    error: generationError,
    showAuthDialog,
    setShowAuthDialog,
    showLimitDialog,
    setShowLimitDialog,
    imageRefs,
    initializeImageStates
  } = useCardGeneration()

  // Combine errors from both sources
  const error = generationError || null;
  const isLoading = globalLoading;

  useEffect(() => {
    setCurrentCardType(wishCardType)
    // Reset form data and set default values
    const initialFormData: Record<string, any> = {};

    // Initialize with the correct default values based on card config
    cardConfig.fields.forEach(field => {
      if (field.type === 'select' && !field.optional && field.defaultValue) {
        initialFormData[field.name] = field.defaultValue;
      }
    });

    // Set default format to 'svg'
    initialFormData["format"] = "svg";
    setFormData(initialFormData);

    // Set default image URL based on whether it's a system card
    const defaultImgUrl = cardConfig.isSystem ? `https://store.celeprime.com/${wishCardType}.svg` : sampleCard;

    // Initialize image states with the default URL
    initializeImageStates(imageCount, defaultImgUrl);

  }, [wishCardType, cardConfig, sampleCard, imageCount, initializeImageStates]);

  // Add effect to watch for auth status changes
  useEffect(() => {
    // If we were waiting for auth and now the user is authenticated
    if (pendingAuthRef.current && session && savedFormData) {
      pendingAuthRef.current = false;
      // Restore saved form data
      setFormData(savedFormData.formData);
      setCustomValues(savedFormData.customValues);
      setSelectedSize(savedFormData.selectedSize);
      if (savedFormData.cardRequirements) {
        setCardRequirements(savedFormData.cardRequirements);
      }

      // Close the auth dialog
      setShowAuthDialog(false);

      // Optionally, trigger card generation automatically
      setTimeout(() => {
        handleGenerateCard();
      }, 500);
    }
  }, [session, savedFormData, setShowAuthDialog]);

  // Add effect to set premium status when session changes
  useEffect(() => {
    if (session?.user) {
      setIsPremiumUser((session as any).user?.plan === 'PREMIUM');
    } else {
      setIsPremiumUser(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSvgContent(sampleCard)
  }, [])

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageCountChange = (count: number) => {
    setImageCount(count);

    // Update image-related arrays based on the new count
    // This is needed to properly initialize the UI before the first generation
    const defaultImgUrl = cardConfig.isSystem
      ? `https://store.celeprime.com/${wishCardType}.svg`
      : sampleCard;

    // Re-initialize image states with the new count
    initializeImageStates(count, defaultImgUrl);
  };

  const handleGenerateCard = async () => {
    // Validate required fields
    const requiredFields = cardConfig.fields.filter(field => !field.optional);
    const missingFields = requiredFields.filter(field => !formData[field.name]);

    if (missingFields.length > 0) {
      setErrorToast({
        title: 'Required Fields Missing',
        message: `Please fill in the following required fields: ${missingFields.map(f => f.label || f.placeholder).join(', ')}`,
        type: 'error'
      });
      return;
    }

    // If user not authenticated, save form data and show auth dialog
    if (!session) {
      setSavedFormData({
        formData: { ...formData },
        customValues: { ...customValues },
        selectedSize,
        cardRequirements
      });
      pendingAuthRef.current = true;
      setIsPremiumUser(false) // User is not logged in, so definitely not premium
      setShowAuthDialog(true);
      return;
    }

    const options = {
      cardType: currentCardType,
      size: selectedSize,
      format: formData.format || 'svg',
      modelTier: formData.modelTier || "Free",
      formData: { ...formData, cardRequirements },
      imageCount
    };

    try {
      const result = await generateCards(options);

      if (result.success) {
        setSubmited(true);
        // Clear card requirements after successful generation
        setCardRequirements('');
      } else if (result.error === 'rate_limit') {
        setErrorToast({
          title: 'Daily Limit Reached',
          message: 'Free users can generate up to 3 cards per day. Please try again tomorrow or explore our Card Gallery.',
          type: 'warning'
        });
      } else if (result.error === 'auth') {
        setErrorToast({
          title: 'Sign In Required',
          message: 'Please sign in to continue generating cards.',
          type: 'info'
        });
      } else {
        setErrorToast({
          title: 'Generation Failed',
          message: result.error || 'An error occurred while generating your card. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      setErrorToast({
        title: 'System Error',
        message: 'Sorry, something went wrong. Please try again later.',
        type: 'error'
      });
    }
  };

  const handleLogin = async () => {
    try {
      setIsAuthLoading(true)
      await signIn('google', { callbackUrl: window.location.href })
    } catch (error) {
      console.error('Login failed:', error)
      setIsAuthLoading(false)
    }
  }



  const renderField = (field: CardConfig['fields'][0]) => {
    const isRequired = !field.optional;
    const labelClass = `${isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`;

    const inputComponent = (() => {
      switch (field.type) {
        case 'text':
        case 'number':
          return (
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="text-base"
              required={isRequired}
            />
          );
        case 'textarea':
          return (
            <Textarea
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="resize-none text-base"
              required={isRequired}
            />
          );
        case 'select':
          return (
            <CustomSelect
              value={formData[field.name] || ''}
              onValueChange={(value) => handleInputChange(field.name, value)}
              customValue={customValues[field.name] || ''}
              onCustomValueChange={(value) => {
                setCustomValues(prev => ({ ...prev, [field.name]: value }));
              }}
              placeholder={(field.placeholder || `Select ${field.label}`).replace('(optional)', '')}
              options={field.options || []}
              required={isRequired}
              label={field.label}
            />
          );
        case 'age':
          return (
            <AgeSelector
              age={formData[field.name] || null}
              setAge={(value: number | null) => handleInputChange(field.name, value || '')}
            />
          );
        default:
          return null;
      }
    })();

    return (
      <div key={field.name} className="space-y-2">
        {field.label && <Label htmlFor={field.name} className={labelClass}>{field.label}</Label>}
        {inputComponent}
      </div>
    );
  }

  // Add error toast component
  const ErrorToast = () => {
    if (!errorToast) return null;

    const icons = {
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />
    };

    const colors = {
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200'
    };

    return (
      <div className={cn(
        "fixed top-4 right-4 z-50 w-96 p-4 rounded-lg border shadow-lg",
        colors[errorToast.type]
      )}>
        <div className="flex items-start space-x-3">
          {icons[errorToast.type]}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{errorToast.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{errorToast.message}</p>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Add auto-dismiss effect for error toast
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => {
        setErrorToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  if (!cardConfig) {
    return <div>Invalid card type</div>
  }

  return (
    <>
      <ErrorToast />
      <main className="mx-auto pb-32">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
          <Card className="p-4 sm:p-6 bg-white border border-[#FFC0CB] shadow-md w-full max-w-md relative">
            <CardContent className="space-y-4">
              {cardConfig.fields.map((field) => renderField(field))}

              {/* Color Selection */}
              <div key="card-design" className="space-y-2">
                <Label htmlFor="card-design" className="flex justify-between items-center">
                  <span>Design</span>
                </Label>
                <div className="grid grid-cols-8 gap-2 w-full">
                  {[
                    { id: "black", name: "Black", color: "#000000" },
                    { id: "gray", name: "Gray", color: "#BDBDBD" },
                    { id: "white", name: "White", color: "#FFFFFF", border: true },
                    { id: "red", name: "Red", color: "#D32F2F" },
                    { id: "purple", name: "Purple", color: "#7B1FA2" },
                    { id: "pink", name: "Pink", color: "#FF80AB" },
                    { id: "green", name: "Green", color: "#388E3C" },
                    { id: "light-green", name: "Light Green", color: "#A5D6A7" },
                    { id: "blue", name: "Blue", color: "#1976D2" },
                    { id: "navy", name: "Navy", color: "#283593" },
                    { id: "sky", name: "Sky Blue", color: "#B3E5FC" },
                    { id: "gold", name: "Gold", color: "#D4AF37" },
                    { id: "beige", name: "Beige", color: "#F5F5DC" },
                    { id: "yellow", name: "Yellow", color: "#FFF176" },
                    { id: "brown", name: "Brown", color: "#8D5524" },
                    { id: "peach", name: "Peach", color: "#FFCC99" },
                  ].map((color) => {
                    const colorValue = `${color.id}`;
                    const isSelected = formData["design"] === colorValue;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleInputChange("design", isSelected ? '' : colorValue)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                          isSelected
                            ? "border-[#b19bff] ring-2 ring-[#b19bff]"
                            : color.border ? "border-gray-300" : "border-transparent"
                        )}
                        style={{ backgroundColor: color.color }}
                        aria-label={color.name}
                      >
                        {isSelected && (
                          <span className="block w-3 h-3 rounded-full border-2 border-white bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomValues(prev => ({
                      ...prev,
                      design: formData["design"] === "custom" ? "" : (prev.design || "")
                    }));
                    handleInputChange("design", formData["design"] === "custom" ? "" : "custom");
                  }}
                  className={cn(
                    "mt-1 w-full py-1.5 px-2 border rounded-md flex items-center justify-center gap-1 transition-all duration-200 text-sm",
                    formData["design"] === "custom"
                      ? "border-[#b19bff] bg-[#b19bff]/10"
                      : "border-gray-200 hover:border-[#b19bff] hover:bg-[#b19bff]/5"
                  )}
                >
                  <span className="text-sm">✨</span>
                  <span className={formData["design"] === "custom" ? "text-[#b19bff] font-medium" : "text-gray-600"}>
                    Custom Design
                  </span>
                </button>
                {formData["design"] === "custom" && (
                  <div className="mt-1">
                    <Input
                      value={customValues["design"] || ''}
                      onChange={(e) => {
                        setCustomValues(prev => ({ ...prev, design: e.target.value }));
                        handleInputChange("design", "custom");
                      }}
                      placeholder="Describe any design you want: colors, patterns, style, layout..."
                      className="border-[#b19bff] focus-visible:ring-[#b19bff] text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Examples: &ldquo;pastel watercolor with flowers&rdquo;, &ldquo;modern minimalist&rdquo;, &ldquo;hand-drawn cartoon style&rdquo;
                    </p>
                  </div>
                )}
              </div>
              {/* Price / Model Selection */}
              <div className="space-y-2">
                <Label>Model</Label>
                <div className="flex space-x-2">
                  {["Free", "Premium"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (option === "Premium" && !isPremiumUser) {
                          // 如果点击 Premium 且不是 Premium 用户，弹出升级提示
                          setIsPremiumModalOpen(true);
                        } else {
                          handleInputChange("modelTier", option);
                        }
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-md border transition-all duration-200",
                        (formData.modelTier === undefined && option === "Free") ||
                          formData.modelTier === option
                          ? option === "Premium"
                            ? "bg-gradient-to-r from-[#a786ff] to-[#FF6B94] text-white font-medium border-transparent"
                            : "bg-[#FFF5F6] text-[#4A4A4A] font-medium border-[#FFC0CB]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#FFC0CB]"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.modelTier === "Premium"
                    ? "Premium model provides higher quality and more creative effects"
                    : "Free model available for all users"}
                </p>
              </div>

              

              {/* Card Format Selection */}
              <div className="w-full">
                <Label htmlFor="card-format" className="mb-2 block flex items-center justify-between">
                  <span>Card Format</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, format: 'svg' }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md border transition-all relative",
                      formData.format !== 'image'
                        ? "border-[#FFC0CB] bg-[#FFF5F6] ring-1 ring-[#FFC0CB]"
                        : "border-gray-200 hover:border-[#FFC0CB]"
                    )}
                  >
                    <div className="absolute -top-2 -right-2">
                      <div className="animate-bounce flex items-center justify-center bg-[#FFC0CB] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        <span className="mr-0.5">✨</span>Animated
                      </div>
                    </div>
                    <span className="text-sm font-medium">Animated Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, format: 'image' }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md border transition-all relative",
                      formData.format === 'image'
                        ? "border-[#FFC0CB] bg-[#FFF5F6] ring-1 ring-[#FFC0CB]"
                        : "border-gray-200 hover:border-[#FFC0CB]"
                    )}
                  >
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="animate-pulse flex items-center justify-center bg-gradient-to-r from-[#a786ff] to-[#b19bff] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                        <span className="mr-0.5 text-[8px]">✨</span>BETA
                      </div>
                    </div>
                    <span className="text-sm font-medium">Image Card</span>
                  </button>
                </div>
              </div>

              {/* Image Count Selection */}
              {/* <div className="w-full">
                <Label htmlFor="image-count" className="mb-2 block flex items-center justify-between">
                  <span>Number of Images</span>
                  <span className="text-xs text-gray-500">{imageCount} image{imageCount > 1 ? 's' : ''}</span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleImageCountChange(count)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-md border transition-all relative text-sm font-medium",
                        imageCount === count
                          ? "border-[#FFC0CB] bg-[#FFF5F6] ring-1 ring-[#FFC0CB] text-[#4A4A4A]"
                          : "border-gray-200 hover:border-[#FFC0CB] text-gray-700"
                      )}
                    >
                      {count}
                      {count > 1 && (
                        <div className="absolute -top-1 -right-1">
                          <div className="flex items-center justify-center bg-gradient-to-r from-[#a786ff] to-[#b19bff] text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                            ✨
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Generate multiple variations at once to compare different styles
                </p>
              </div> */}
            </CardContent>
          </Card>

          <div className="flex flex-col lg:flex-row items-center justify-center my-4 lg:my-0">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-[#b19bff] transform rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="w-full max-w-md">
            <div className={cn(
              "grid gap-3",
              imageCount === 1 ? "grid-cols-1" :
                imageCount === 2 ? "grid-cols-2" :
                imageCount === 3 ? "grid-cols-2" :
                  "grid-cols-2"
            )}>
              {imageStates.map((imageState, index) => (
                <div
                  key={index}
                  ref={(el) => { imageRefs.current[index] = el }}
                  className={cn(
                    "bg-white p-2 sm:p-3 rounded-lg shadow-lg flex items-center justify-center relative border border-[#FFC0CB]",
                    "aspect-[2/3]",
                    imageCount === 3 && index === 2 ? "col-span-2" : "",
                    imageCount === 4 && index >= 2 ? "col-span-1" : ""
                  )}
                >
                  {imageState.isLoading ? (
                    <div className="w-full h-full relative">
                      <MagicalCardCreation />
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 border border-pink-200">
                          <div
                            className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${imageState.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-center">
                          <span className="text-xs text-purple-600 font-medium bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-purple-100">
                            {imageState.progress < 20 ? '🎨 Sketching ideas...' : 
                             imageState.progress < 40 ? '🌈 Mixing colors...' :
                             imageState.progress < 60 ? '✨ Sprinkling magic...' : 
                             imageState.progress < 80 ? '🎭 Adding personality...' :
                             imageState.progress < 95 ? '🌟 Final touches...' : '🎉 Masterpiece ready!'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      {imageState.url && (
                        <ImageViewer
                          alt={`${currentCardType}-${index}`}
                          cardId={imageState.id}
                          cardType={currentCardType}
                          imgUrl={imageState.url}
                          isNewCard={true}
                          svgContent={imageState.svgContent}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Custom animations for magical card creation */}
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-8px) translateX(2px) rotate(2deg); }
          66% { transform: translateY(4px) translateX(-2px) rotate(-1deg); }
        }
        
        @keyframes sparkle-dance {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
          50% { transform: scale(0.8) rotate(180deg); opacity: 1; }
          75% { transform: scale(1.1) rotate(270deg); opacity: 0.9; }
        }
        
        @keyframes magic-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 182, 193, 0.3); }
          50% { box-shadow: 0 0 20px rgba(255, 182, 193, 0.8), 0 0 30px rgba(221, 160, 221, 0.4); }
        }
        
        @keyframes wand-wave {
          0% { transform: rotate(45deg) translateY(0px); }
          50% { transform: rotate(55deg) translateY(-3px); }
          100% { transform: rotate(45deg) translateY(0px); }
        }
        
        .animate-float-gentle { animation: float-gentle 3s ease-in-out infinite; }
        .animate-sparkle-dance { animation: sparkle-dance 2s ease-in-out infinite; }
        .animate-magic-glow { animation: magic-glow 2s ease-in-out infinite; }
        .animate-wand-wave { animation: wand-wave 1.5s ease-in-out infinite; }
      `}</style>

      {/* Floating Card Requirements Input */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-[#FFC0CB] p-4 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FFC0CB] to-[#b19bff] rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-sm">✨</span>
              </div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={cardRequirements}
                onChange={(e) => setCardRequirements(e.target.value)}
                placeholder={imageCount > 1 
                  ? "Describe your special requirements for the card... (e.g. 'Add more decorations', 'Use warm colors')"
                  : "Describe your special requirements for the card... (e.g. 'Add shiny stars', 'Use pink theme')"}
                className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-0 text-sm placeholder-gray-400 bg-transparent resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerateCard();
                  }
                }}
              />
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={handleGenerateCard}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#FFC0CB] to-[#FFB6C1] hover:from-[#FFD1DC] hover:to-[#FFC0CB] text-[#4A4A4A] text-sm px-4 py-2 h-auto transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-1">✨</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="mr-1">🎨</span>
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="border border-[#FFC0CB] shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#4A4A4A]">Sign in Required</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Please sign in with Google to generate your card.
              Alternatively, you can browse our <a href="/card-gallery/" className="text-[#FFC0CB] hover:text-[#FFD1DC] hover:underline transition-colors">Card Templates</a> to use existing templates.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/card-gallery/')}
              className="border-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFF5F6] hover:text-[#4A4A4A]"
            >
              View Templates
            </Button>
            <Button
              onClick={handleLogin}
              disabled={isAuthLoading}
              className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors relative"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in with Google'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="border border-[#FFC0CB] shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#4A4A4A]">Daily Limit Reached</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 space-y-4">
              <p>You&apos;ve reached your daily limit for card generation. Free users can generate up to 3 cards per day.</p>

              <div className="bg-[#FFF5F6] p-4 rounded-lg border border-[#FFC0CB]">
                <p className="text-[#4A4A4A] font-medium">Don&apos;t worry! You can still create beautiful cards by:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#4A4A4A]">
                  <li>Using our pre-made templates</li>
                  <li>Customizing existing designs</li>
                  <li>Saving your favorites for later</li>
                </ul>
              </div>

              <div className="mt-4 bg-[#f0f4ff] p-4 rounded-lg border border-[#a786ff]">
                <p className="text-[#4A4A4A] font-medium flex items-center">
                  <span className="text-lg mr-2">✨</span>
                  Get 10 Extra Generations!
                </p>
                <div className="mt-2 space-y-2 text-[#4A4A4A]">
                  <p className="text-sm">Share MewTruCard.com on your favorite platform:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1.5">
                    <li>Share a link to mewtrucard.com on a forum, blog, or social media</li>
                    <li>Email the shared URL and your account email to:
                      <span className="font-medium text-[#a786ff]"> support@mewtrucard.com</span>
                    </li>
                    <li>We&apos;ll add 10 extra generations to your account!</li>
                  </ol>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={() => {
                setShowLimitDialog(false)
                router.push('/card-gallery/')
              }}
              className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors w-full"
            >
              Browse Card Templates
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!isPremiumUser && (
        <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />
      )}
    </>
  )
}