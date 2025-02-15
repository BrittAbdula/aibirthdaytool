'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import confetti from 'canvas-confetti'
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageViewer } from '@/components/ImageViewer'
import { cn, fetchSvgContent } from '@/lib/utils'
import { CardType, getCardConfig, getAllCardTypes, CardConfig } from '@/lib/card-config'
import { useSession, signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import { CARD_SIZES } from '@/lib/card-config'

const FlickeringGrid = () => {
  return (
    <div className="w-full h-full grid grid-cols-10 grid-rows-15 gap-1">
      {[...Array(150)].map((_, i) => (
        <div
          key={i}
          className="bg-[#FFC0CB] opacity-0 animate-flicker"
          style={{
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        />
      ))}
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
            <SelectItem value="custom" className="text-[#b19bff]">✨ Custom {label} (Any keywords)</SelectItem>
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
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [currentCardType, setCurrentCardType] = useState<CardType>(wishCardType)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [imgUrl, setImgUrl] = useState<string>(`https://store.celeprime.com/${wishCardType}.svg`)
  const [cardId, setCardId] = useState<string | null>(initialCardId)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const sampleCard = `/card/goodluck.svg`
  const [submited, setSubmited] = useState(false)
  const [progress, setProgress] = useState(0)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [selectedSize, setSelectedSize] = useState(cardConfig.defaultSize || 'portrait')

  useEffect(() => {
    setCurrentCardType(wishCardType)
    // Reset form data and set default values
    const initialFormData: Record<string, any> = {};
    if (!cardConfig.isSystem) {
      setImgUrl(sampleCard)
    }
    cardConfig.fields.forEach(field => {
      if (field.type === 'select' && !field.optional && field.defaultValue) {
        initialFormData[field.name] = field.defaultValue;
      }
    });
    // Set default card style to 'classic'
    initialFormData["style"] = "classic";
    setFormData(initialFormData);
  }, [wishCardType, cardConfig])

  useEffect(() => {
    fetchSvgContent(sampleCard)
  }, [])

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCardTypeChange = (newCardType: CardType) => {
    router.push(`/${newCardType}/`)
  }

  const handleGenerateCard = async () => {
    if (!session) {
      setShowAuthDialog(true)
      return
    }

    try {
      setIsLoading(true)
      setProgress(0)
      setError(null)

      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardType: currentCardType,
          size: selectedSize,
          ...formData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setShowLimitDialog(true)
          return
        }
        if (response.status === 401) {
          setShowAuthDialog(true)
          return
        }
        throw new Error(data.error || 'Failed to generate card')
      }

      if (!data.r2Url) {
        throw new Error('Failed to get image URL')
      }

      setImgUrl(data.r2Url)
      // console.log('-----------r2Url',data.r2Url)
      setCardId(data.cardId)
      setSubmited(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (err: any) {
      setError(err.message || 'Failed to generate card. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
        <Label htmlFor={field.name} className={labelClass}>{field.label}</Label>
        {inputComponent}
      </div>
    );
  }

  if (!cardConfig) {
    return <div>Invalid card type</div>
  }

  return (
    <>
      <main className=" mx-auto ">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
          <Card className="p-4 sm:p-6 bg-white border border-[#FFC0CB] shadow-md w-full max-w-md relative">
            <CardContent className="space-y-4">
              {cardConfig.fields.map((field) => renderField(field))}

              {/* Style Selection */}
              <div key="card-style" className="space-y-2">
                <Label htmlFor="card-style">Style (Color, Animation, any keywords)</Label>
                <CustomSelect
                  value={formData["style"] || ''}
                  onValueChange={(value) => handleInputChange("style", value)}
                  customValue={customValues["style"] || ''}
                  onCustomValueChange={(value) => {
                    setCustomValues(prev => ({ ...prev, style: value }));
                  }}
                  placeholder="Select Card Style"
                  options={["classic", "modern", "minimal", "vintage"]}
                  required={true}
                  label="Style"
                />
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <Label>Card Size</Label>
                <Select
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select card size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CARD_SIZES).map(([id, size]) => (
                      <SelectItem key={id} value={id}>
                        {size.name} ({size.width}x{size.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {CARD_SIZES[selectedSize].orientation} orientation
                </p>
              </div>

              {showAdvancedOptions && cardConfig.advancedFields && (
                <>
                  {cardConfig.advancedFields.map((field) => renderField(field))}
                </>
              )}
              {cardConfig.advancedFields && cardConfig.advancedFields.length > 0 && (
                <div className="flex justify-end">
                  <button
                    className="text-[#FFC0CB] hover:text-[#FFD1DC] focus:outline-none"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]" onClick={handleGenerateCard} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Card'}
              </Button>
            </CardFooter>
          </Card>

          <div className="flex flex-col lg:flex-row items-center justify-center my-4 lg:my-0">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-[#b19bff] transform rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="w-full max-w-md">
            {isLoading && <ProgressBar progress={progress} />}
            <div className="bg-white p-3 sm:p-5 rounded-lg shadow-lg flex items-center justify-center relative border border-[#FFC0CB] aspect-[2/3]">
              {isLoading ? (
                <FlickeringGrid />
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <ImageViewer alt={currentCardType} cardId={cardId || '1'} cardType={currentCardType} imgUrl={imgUrl} isNewCard={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
    </>
  )
}