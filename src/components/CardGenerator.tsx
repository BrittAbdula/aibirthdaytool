'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageViewer } from '@/components/ImageViewer'
import { cn, fetchSvgContent } from '@/lib/utils'
import { CardType, CardConfig } from '@/lib/card-config'
import { useSession, signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import { useCardGeneration } from '@/hooks/useCardGeneration'
import { AlertCircle, Info } from 'lucide-react'
import { PremiumModal } from '@/components/PremiumModal'
import { modelConfigs, type ModelConfig } from '@/lib/model-config'
import AdsenseSlot from '@/components/AdsenseSlot'

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
  const router = useRouter()
  const sampleCard = `/card/goodluck.svg`
  const [submited, setSubmited] = useState(false)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [selectedSize, setSelectedSize] = useState(cardConfig.defaultSize || 'portrait')
  // Unified input lives in the main form as `message`
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(modelConfigs[0]) // Default to first model
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showReferenceImageModal, setShowReferenceImageModal] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [errorToast, setErrorToast] = useState<{
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  } | null>(null);
  const [isVideoMode, setIsVideoMode] = useState(false);

  // Add ref to track if we're waiting for authentication
  const pendingAuthRef = useRef<boolean>(false)
  // Add state to store form data before authentication
  const [savedFormData, setSavedFormData] = useState<{
    formData: Record<string, any>,
    customValues: Record<string, string>,
    selectedSize: string,
    selectedModel: ModelConfig
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

  // Card type selectable options (include current type + common types)
  const cardTypeOptions = React.useMemo(() => {
    const defaults = ['birthday','anniversary','valentine','sorry','thank-you','congratulations','love','get-well','graduation','wedding','holiday','baby'];
    const withCurrent = [wishCardType, ...defaults].filter(Boolean) as string[];
    return Array.from(new Set(withCurrent));
  }, [wishCardType]);

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
      if (savedFormData.selectedModel) {
        setSelectedModel(savedFormData.selectedModel);
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

  // Sync video mode with selected model format
  useEffect(() => {
    const currentFormat = selectedModel.format;
    
    // Update video mode based on selected model format
    if (currentFormat === 'video' && !isVideoMode) {
      setIsVideoMode(true);
    } else if (currentFormat !== 'video' && isVideoMode) {
      setIsVideoMode(false);
    }
  }, [selectedModel.format, isVideoMode]);

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
        selectedModel
      });
      pendingAuthRef.current = true;
      setIsPremiumUser(false) // User is not logged in, so definitely not premium
      setShowAuthDialog(true);
      return;
    }

    const options = {
      cardType: currentCardType,
      size: selectedSize,
      modelId: selectedModel.id, // 只传递模型ID
      formData: { ...formData },
      imageCount
    };

    try {
      const result = await generateCards(options);

      if (result.success) {
        setSubmited(true);
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
              placeholder={field.name === 'message' ? (field.placeholder || 'Enter your message and any design requirements') : field.placeholder}
              rows={field.name === 'message' ? 3 : 2}
              className="resize-none text-base"
              required={isRequired}
              onKeyPress={(e) => {
                if (field.name === 'message' && e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateCard();
                }
              }}
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

  // No floating input; unified input is in main form

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
              {/* Card Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="card-type" className="flex justify-between items-center">
                  <span>Card Type</span>
                </Label>
                <CustomSelect
                  value={currentCardType}
                  onValueChange={(value) => setCurrentCardType(value as CardType)}
                  customValue={customValues['cardType'] || ''}
                  onCustomValueChange={(value) => {
                    setCustomValues(prev => ({ ...prev, cardType: value }));
                    setCurrentCardType((value || '') as CardType);
                  }}
                  placeholder="Select card type"
                  options={cardTypeOptions}
                  label="Card Type"
                />
              </div>
              
              {/* Fallback message field if not defined in config */}
              {!cardConfig.fields.some((f) => f.name === 'message') && (
                <div key="message" className="space-y-2">
                  <Label htmlFor="message" className="after:content-[''] after:ml-0.5 after:text-red-500">Message</Label>
                  <Textarea
                    id="message"
                    value={formData['message'] || ''}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Enter your message and any design requirements"
                    rows={3}
                    className="resize-none text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerateCard();
                      }
                    }}
                  />
                </div>
              )}

              {/* Optional mood/tone if not provided by config */}
              {!cardConfig.fields.some((f) => f.name === 'tone') && (
                <div key="tone" className="space-y-2">
                  <Label htmlFor="tone">Mood (optional)</Label>
                  <CustomSelect
                    value={(formData['tone'] as string) || ''}
                    onValueChange={(value) => handleInputChange('tone', value)}
                    customValue={''}
                    onCustomValueChange={() => {}}
                    placeholder="Choose mood: surprise, touching or humor"
                    options={[ 'surprise', 'touching', 'humor' ]}
                    label="Mood"
                  />
                </div>
              )}

            {cardConfig.fields.map((field) => renderField(field))}

            {/* Color Selection */}
            <div key="card-design" className="space-y-2">
                <Label htmlFor="card-design" className="flex justify-between items-center">
                  <span>Color</span>
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


              {/* Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Select Model"
                  >
                    <span className="text-lg">{selectedModel.icon}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-gray-700">{selectedModel.name}</span>
                      <span className="text-xs text-gray-500">{selectedModel.format === 'video' ? 'Video' : selectedModel.format === 'svg' ? 'Animated' : 'Static'}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReferenceImageModal(true)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors relative"
                    title="Upload Reference Image"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateCard}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#FFC0CB] to-[#b19bff] hover:from-[#FFD1DC] hover:to-[#FFB6C1] text-[#4A4A4A] transition-all"
                >
                  {isLoading ? 'Generating…' : 'Generate'}
                </Button>
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
                      {/* Ad slot during generation */}
                      {!!process.env.NEXT_PUBLIC_ADSENSE_SLOT_GENERATION && !isPremiumUser && (
                        <div className="absolute top-3 left-3 right-3 z-10">
                          <AdsenseSlot className="mx-auto" />
                        </div>
                      )}
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
                          cardId={imageState.id || '1'}
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

      {/* Model Selection Dropdown */}
      {showModelSelector && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" 
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setShowModelSelector(false);
            }
          }}
        >
          <div className="fixed bottom-44 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">Choose Generation Model</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{selectedModel.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{selectedModel.name}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Select the perfect model for your card creation needs</p>
              </div>
              
              <div className="p-4">
                {/* Image & Animation Models */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <span className="text-lg mr-2">🎨</span>
                    <h4 className="font-medium text-gray-800">Image & Animation Models</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modelConfigs
                      .filter(model => model.format === 'svg' || model.format === 'image')
                      .map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          if (model.tier === 'Premium' && !isPremiumUser) {
                            setIsPremiumModalOpen(true);
                          } else {
                            setSelectedModel(model);
                            setIsVideoMode(false); // Ensure we're in image mode
                            setShowModelSelector(false);
                          }
                        }}
                        disabled={false} // Always allow clicking
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200 text-left relative",
                          model.tier === 'Premium' && !isPremiumUser 
                            ? "border-gray-200 bg-gray-50 cursor-pointer" // Changed from cursor-not-allowed to cursor-pointer
                            : selectedModel.id === model.id && !isVideoMode
                            ? "border-[#FFC0CB] bg-[#FFF5F6] shadow-sm"
                            : "border-gray-100 hover:border-[#FFC0CB] hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-lg">
                              {model.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{model.name}</h4>
                              {model.badge && (
                                <span className="bg-gradient-to-r from-[#a786ff] to-[#FF6B94] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                  {model.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{model.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{model.format === 'svg' ? '🎞️' : '🖼️'}</span>
                                <span>{model.format === 'svg' ? 'Animated' : 'Static'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>💳</span>
                                <span>{model.credits} credit{model.credits > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          {selectedModel.id === model.id && !isVideoMode && (model.tier !== 'Premium' || isPremiumUser) && (
                            <div className="flex-shrink-0 text-[#FFC0CB]">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Models */}
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-lg mr-2">🎬</span>
                    <h4 className="font-medium text-gray-800">Video Models</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modelConfigs
                      .filter(model => model.format === 'video')
                      .map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          if (model.tier === 'Premium' && !isPremiumUser) {
                            setIsPremiumModalOpen(true);
                          } else {
                            setSelectedModel(model);
                            setIsVideoMode(true); // Ensure we're in video mode
                            setShowModelSelector(false);
                          }
                        }}
                        disabled={false} // Always allow clicking
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200 text-left relative",
                          model.tier === 'Premium' && !isPremiumUser 
                            ? "border-gray-200 bg-gray-50 cursor-pointer" // Changed to match other Premium models
                            : selectedModel.id === model.id && isVideoMode
                            ? "border-[#FFC0CB] bg-[#FFF5F6] shadow-sm"
                            : "border-gray-100 hover:border-[#FFC0CB] hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg">
                              {model.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{model.name}</h4>
                              {model.badge && (
                                <span className="bg-gradient-to-r from-[#a786ff] to-[#FF6B94] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                  {model.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>⏱️</span>
                                <span>{model.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>🎬</span>
                                <span>Video</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>💳</span>
                                <span>{model.credits} credits</span>
                              </div>
                            </div>
                          </div>
                          {selectedModel.id === model.id && isVideoMode && (model.tier !== 'Premium' || isPremiumUser) && (
                            <div className="flex-shrink-0 text-[#FFC0CB]">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating input removed; controls moved into form */}

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

      {/* Reference Image Upload Modal */}
      <Dialog open={showReferenceImageModal} onOpenChange={setShowReferenceImageModal}>
        <DialogContent className="border border-[#FFC0CB] shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#4A4A4A] flex items-center space-x-2">
              <span>📸</span>
              <span>Reference Image Upload</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                COMING SOON
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-3 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="text-lg mr-2">🎯</span>
                  Exciting Feature Coming Soon!
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Upload reference images to help our AI understand your style preferences and create cards that match your vision perfectly.
                </p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Upload up to 2 reference images</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Support for JPG, PNG, WebP formats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>AI-powered style matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Enhanced card personalization</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500 text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">In the meantime...</h4>
                    <p className="text-sm text-gray-700">
                      You can describe your desired style in the text input above. For example: 
                      &ldquo;watercolor style&rdquo;, &ldquo;minimalist design&rdquo;, &ldquo;vintage look&rdquo;, etc.
                    </p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setShowReferenceImageModal(false)}
              className="bg-gradient-to-r from-[#FFC0CB] to-[#FFB6C1] hover:from-[#FFD1DC] hover:to-[#FFC0CB] text-[#4A4A4A] transition-colors px-6"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
