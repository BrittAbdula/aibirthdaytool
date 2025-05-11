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
  const [imageCount, setImageCount] = useState<number>(1)
  const [imgUrls, setImgUrls] = useState<string[]>([`https://store.celeprime.com/${wishCardType}.svg`])
  const [cardIds, setCardIds] = useState<string[]>([initialCardId || ''])
  const [svgContents, setSvgContents] = useState<string[]>([''])
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
  const [modificationFeedback, setModificationFeedback] = useState<string>('')
  const [feedbackMode, setFeedbackMode] = useState<boolean>(false)
  const [previousFormData, setPreviousFormData] = useState<Record<string, any>>({})
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([])
  
  // Add a ref to track if we're waiting for authentication
  const pendingAuthRef = useRef<boolean>(false)
  // Add a state to store form data before authentication
  const [savedFormData, setSavedFormData] = useState<{
    formData: Record<string, any>,
    customValues: Record<string, string>,
    selectedSize: string,
    modificationFeedback: string
  } | null>(null)

  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([])
  const [imageProgresses, setImageProgresses] = useState<number[]>([])
  const imageRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    setCurrentCardType(wishCardType)
    // Reset form data and set default values
    const initialFormData: Record<string, any> = {};
    
    // Initialize arrays with the correct length based on imageCount
    const defaultImgUrl = cardConfig.isSystem ? `https://store.celeprime.com/${wishCardType}.svg` : sampleCard
    setImgUrls(Array(imageCount).fill(defaultImgUrl))
    setCardIds(Array(imageCount).fill(initialCardId || ''))
    setSvgContents(Array(imageCount).fill(''))
    setImageLoadingStates(Array(imageCount).fill(false))
    setImageProgresses(Array(imageCount).fill(0))
    
    if (!cardConfig.isSystem) {
      setImgUrls(Array(imageCount).fill(sampleCard))
    }
    
    cardConfig.fields.forEach(field => {
      if (field.type === 'select' && !field.optional && field.defaultValue) {
        initialFormData[field.name] = field.defaultValue;
      }
    });
    // Set default format to 'svg'
    initialFormData["format"] = "svg";
    setFormData(initialFormData);
  }, [wishCardType, cardConfig])

  useEffect(() => {
    fetchSvgContent(sampleCard)
  }, [])

  // Add effect to watch for auth status changes
  useEffect(() => {
    // If we were waiting for auth and now the user is authenticated
    if (pendingAuthRef.current && session && savedFormData) {
      pendingAuthRef.current = false;
      // Restore saved form data
      setFormData(savedFormData.formData);
      setCustomValues(savedFormData.customValues);
      setSelectedSize(savedFormData.selectedSize);
      if (savedFormData.modificationFeedback) {
        setModificationFeedback(savedFormData.modificationFeedback);
      }
      
      // Close the auth dialog
      setShowAuthDialog(false);
      
      // Optionally, trigger card generation automatically
      setTimeout(() => {
        handleGenerateCard();
      }, 500);
    }
  }, [session, savedFormData]);

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

  // Function to trigger confetti for a specific image
  const triggerConfettiForImage = (index: number) => {
    const imageRef = imageRefs.current[index];
    if (imageRef) {
      const rect = imageRef.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { x, y: y - 0.1 },
        zIndex: 9999
      });
    }
  };

  const handleGenerateCard = async () => {
    if (!session) {
      setSavedFormData({
        formData: {...formData},
        customValues: {...customValues},
        selectedSize,
        modificationFeedback
      });
      pendingAuthRef.current = true;
      setShowAuthDialog(true);
      return;
    }

    try {
      // Save previous form data for potential modifications
      setPreviousFormData({...formData})

      // Reset image states
      const newLoadingStates = Array(imageCount).fill(true);
      setImageLoadingStates(newLoadingStates);
      setImageProgresses(Array(imageCount).fill(0));
      setIsLoading(true);

      // Create array to hold promises for parallel requests
      const generatePromises = Array.from({ length: imageCount }).map(async (_, index) => {
        // Start progress timer for this image
        const progressInterval = setInterval(() => {
          setImageProgresses(prev => {
            const newProgresses = [...prev];
            if (newProgresses[index] < 90) {
              newProgresses[index] += 10;
            }
            return newProgresses;
          });
        }, 1000);

        try {
          // Prepare payload with feedback if in feedback mode
          const payload: Record<string, any> = {
            cardType: currentCardType,
            size: selectedSize,
            format: formData.format || 'svg',
            modelTier: formData.modelTier || "Free", // Default to Free if not specified
            ...formData,
            variationIndex: index // Include variation index to ensure different images
          };

          if (feedbackMode && modificationFeedback) {
            payload.modificationFeedback = modificationFeedback;
            payload.previousCardId = cardIds[0] || ''; // Use the first card ID for feedback
            
            // Add to feedback history
            if (index === 0) { // Only add to history once per batch
              setFeedbackHistory([...feedbackHistory, modificationFeedback]);
            }
          }

          const response = await fetch('/api/generate-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 429) {
              setShowLimitDialog(true);
              return { success: false, error: 'rate_limit' };
            }
            if (response.status === 401) {
              // Save form data again in case session expired
              setSavedFormData({
                formData: {...formData},
                customValues: {...customValues},
                selectedSize,
                modificationFeedback
              });
              pendingAuthRef.current = true;
              setShowAuthDialog(true);
              return { success: false, error: 'auth' };
            }
            throw new Error(data.error || 'Failed to generate card');
          }

          // Handle response based on card format
          let imgUrl = '';
          let svgContent = '';
          
          if (formData.format === 'image' && data.r2Url) {
            // For image cards, use the returned image URL directly
            imgUrl = data.r2Url;
          } else if (data.svgContent) {
            // For SVG cards, create a data URL from the SVG content
            imgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.svgContent)}`;
            svgContent = data.svgContent;
          } else {
            throw new Error('Failed to get card content');
          }

          // Update this specific image's state
          setImgUrls(prev => {
            const newUrls = [...prev];
            newUrls[index] = imgUrl;
            return newUrls;
          });

          setSvgContents(prev => {
            const newContents = [...prev];
            newContents[index] = svgContent;
            return newContents;
          });

          setCardIds(prev => {
            const newIds = [...prev];
            newIds[index] = data.cardId;
            return newIds;
          });

          // Set progress to 100% for this image
          setImageProgresses(prev => {
            const newProgresses = [...prev];
            newProgresses[index] = 100;
            return newProgresses;
          });

          // Mark this image as loaded
          setImageLoadingStates(prev => {
            const newStates = [...prev];
            newStates[index] = false;
            return newStates;
          });

          // Trigger confetti for this image
          setTimeout(() => {
            triggerConfettiForImage(index);
          }, 100);

          setSubmited(true);

          return { success: true, index };
        } catch (error: any) {
          return { success: false, error: error.message, index };
        } finally {
          clearInterval(progressInterval);
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(generatePromises);
      
      // Check for any auth or rate limit errors
      const hasAuthError = results.some(result => !result.success && result.error === 'auth');
      const hasRateLimitError = results.some(result => !result.success && result.error === 'rate_limit');
      
      // If we have auth errors or rate limit errors, they've already been handled
      if (!hasAuthError && !hasRateLimitError) {
        // Get any other errors
        const errors = results
          .filter(result => !result.success && result.error !== 'auth' && result.error !== 'rate_limit')
          .map(result => result.error);
          
        if (errors.length > 0) {
          setError(errors[0] || 'Failed to generate one or more cards. Please try again.');
        }
        
        // Show feedback mode after first generation
        if (!feedbackMode) {
          setFeedbackMode(true);
        }
        
        // Clear feedback after successful generation
        if (feedbackMode) {
          setModificationFeedback('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate card. Please try again.');
    } finally {
      setIsLoading(false);
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

  const handleResetFeedback = () => {
    setFeedbackMode(false)
    setModificationFeedback('')
    setFeedbackHistory([])
    setFormData(previousFormData)
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

              {/* Color Selection */}
              <div key="card-color" className="space-y-2">
                <Label htmlFor="card-color" className="flex justify-between items-center">
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
                    const isSelected = formData["color"] === colorValue;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleInputChange("color", isSelected ? '' : colorValue)}
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
                      color: formData["color"] === "custom" ? "" : (prev.color || "")
                    }));
                    handleInputChange("color", formData["color"] === "custom" ? "" : "custom");
                  }}
                  className={cn(
                    "mt-1 w-full py-1.5 px-2 border rounded-md flex items-center justify-center gap-1 transition-all duration-200 text-sm",
                    formData["color"] === "custom"
                      ? "border-[#b19bff] bg-[#b19bff]/10"
                      : "border-gray-200 hover:border-[#b19bff] hover:bg-[#b19bff]/5"
                  )}
                >
                  <span className="text-sm">✨</span>
                  <span className={formData["color"] === "custom" ? "text-[#b19bff] font-medium" : "text-gray-600"}>
                    Custom Color
                  </span>
                </button>
                {formData["color"] === "custom" && (
                  <div className="mt-1">
                    <Input
                      value={customValues["color"] || ''}
                      onChange={(e) => {
                        setCustomValues(prev => ({ ...prev, color: e.target.value }));
                        handleInputChange("color", "custom");
                      }}
                      placeholder="Describe color: e.g. 'rose gold', 'gradient', 'rainbow'..."
                      className="border-[#b19bff] focus-visible:ring-[#b19bff] text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Try: &ldquo;rose gold&rdquo;, &ldquo;gradient&rdquo;, &ldquo;rainbow&rdquo;, etc.
                    </p>
                  </div>
                )}
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

              {/* Image Count Selection */}
              <div className="space-y-2">
                <Label>Number of Cards</Label>
                <div className="flex space-x-2">
                  {[1, 2].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setImageCount(count);
                        
                        // 更新与图片数量相关的数组，但不重置表单数据
                        const defaultImgUrl = cardConfig.isSystem 
                          ? `https://store.celeprime.com/${wishCardType}.svg` 
                          : sampleCard;
                        
                        setImgUrls(prev => {
                          const newUrls = [...prev];
                          while (newUrls.length < count) {
                            newUrls.push(defaultImgUrl);
                          }
                          return newUrls.slice(0, count);
                        });
                        
                        setCardIds(prev => {
                          const newIds = [...prev];
                          while (newIds.length < count) {
                            newIds.push('');
                          }
                          return newIds.slice(0, count);
                        });
                        
                        setSvgContents(prev => {
                          const newContents = [...prev];
                          while (newContents.length < count) {
                            newContents.push('');
                          }
                          return newContents.slice(0, count);
                        });
                        
                        setImageLoadingStates(Array(count).fill(false));
                        setImageProgresses(Array(count).fill(0));
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-md transition-all duration-200",
                        imageCount === count
                          ? "bg-[#FFC0CB] text-white font-medium"
                          : "bg-gray-100 text-gray-700 hover:bg-[#FFE5EB]"
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Generate {imageCount} {imageCount === 1 ? 'card' : 'cards'} with different variations
                </p>
              </div>

              {/* Price / Model Selection */}
              <div className="space-y-2">
                <Label>Model</Label>
                <div className="flex space-x-2">
                  {["Free", "Premium"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInputChange("modelTier", option)}
                      className={cn(
                        "flex-1 py-2 rounded-md border transition-all duration-200 relative",
                        (formData.modelTier === undefined && option === "Free") || 
                        formData.modelTier === option
                          ? option === "Premium" 
                            ? "bg-gradient-to-r from-[#a786ff] to-[#FF6B94] text-white font-medium border-transparent" 
                            : "bg-[#FFF5F6] text-[#4A4A4A] font-medium border-[#FFC0CB]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#FFC0CB]"
                      )}
                    >
                      {option === "Premium" && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="animate-pulse flex items-center justify-center bg-gradient-to-r from-[#a786ff] to-[#FF6B94] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
                            <span className="mr-0.5">💰</span>Coming Soon
                          </div>
                        </div>
                      )}
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

              {/* Card Format Selection */}
              {/* <div className="w-full">
                <Label htmlFor="card-format" className="mb-2 block flex items-center justify-between">
                  <span>Card Format</span>
                  <span className="text-xs text-gray-500 italic">Choose how your card is generated</span>
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
                    
                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M14 7L9 12L14 17" 
                        stroke="#FFC0CB" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="animate-pulse"
                      />
                      <path 
                        d="M5 3L19 21" 
                        stroke="#FFC0CB" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      />
                    </svg>
                    <span className="text-sm font-medium">SVG Card</span>
                    <span className="text-xs text-gray-500 mt-1">Vector graphics</span>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      <span className="block">• Supports animations</span>
                      <span className="block">• Interactive elements</span>
                      <span className="block">• Precise text layout</span>
                    </div>
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
                    
                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#FFC0CB" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="#FFC0CB"/>
                      <path d="M6 14L8 12L10 14L14 10L18 14" stroke="#FFC0CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm font-medium">Image Card</span>
                    <span className="text-xs text-gray-500 mt-1">AI generated image</span>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      <span className="block">• Artistic style</span>
                      <span className="block">• More creative</span>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  SVG cards support animations and interactive elements, while Image cards offer more artistic visual styles.
                </p>
              </div> */}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
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
            <div className={cn(
              "grid gap-3", 
              imageCount === 1 ? "grid-cols-1" : 
              imageCount === 2 ? "grid-cols-2" : 
              "grid-cols-2"
            )}>
              {Array.from({ length: imageCount }).map((_, index) => (
                <div 
                  key={index}
                  ref={(el) => { imageRefs.current[index] = el }}
                  className={cn(
                    "bg-white p-2 sm:p-3 rounded-lg shadow-lg flex items-center justify-center relative border border-[#FFC0CB]",
                    "aspect-[2/3]",
                    imageCount > 2 && index >= 2 ? "col-span-1 row-start-2" : ""
                  )}
                >
                  {imageLoadingStates[index] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <FlickeringGrid />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div
                            className="bg-[#FFC0CB] h-1.5 rounded-full"
                            style={{ width: `${imageProgresses[index]}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      {imgUrls[index] && (
                        <ImageViewer 
                          alt={`${currentCardType}-${index}`} 
                          cardId={cardIds[index] || `${index+1}`} 
                          cardType={currentCardType} 
                          imgUrl={imgUrls[index]} 
                          isNewCard={true} 
                          svgContent={svgContents[index] || ''}
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

      {/* Feedback Section - Add after the main card generation UI */}
      {submited && feedbackMode && (
        <div className="mt-12 max-w-3xl mx-auto relative">
          {/* Magical shimmering outer border with stars */}
          <div className="absolute -inset-3 bg-gradient-to-r from-[#FFB6C1] via-[#b19bff] to-[#87CEFA] rounded-xl opacity-75 blur-md"
               style={{
                 backgroundSize: "200% 200%",
                 animation: "gradient-x 6s ease infinite"
               }}
          />
          
          {/* Animated stars around the border */}
          <div className="absolute -top-4 -left-4 w-8 h-8 text-2xl animate-spin-slow">✨</div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 text-2xl animate-spin-slow-reverse">✨</div>
          <div className="absolute -top-4 -right-4 w-8 h-8 text-2xl animate-bounce-gentle">⭐</div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 text-2xl animate-bounce-gentle">⭐</div>
          
          {/* Sparkle border points */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 rounded-full bg-white animate-twinkle-star"
              style={{
                top: `${Math.sin(i / 3.14) * 100 + 50}%`,
                left: `${Math.cos(i / 3.14) * 100 + 50}%`,
                transformOrigin: 'center',
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 5px 2px rgba(255, 255, 255, 0.7)'
              }}
            />
          ))}
          
          {/* Main content container */}
          <div className="p-6 bg-white rounded-lg shadow-lg relative z-10 border-2 border-transparent">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFB6C1]/10 via-[#b19bff]/10 to-[#87CEFA]/10"
                   style={{ 
                     backgroundSize: "200% 200%",
                     animation: "gradient-x-reverse 8s ease infinite"
                   }}
              />
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-[#FFB6C1] opacity-40 animate-float-slow" 
                 style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-16 left-12 w-4 h-4 rounded-full bg-[#b19bff] opacity-40 animate-float-slow" 
                 style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 right-16 w-5 h-5 rounded-full bg-[#87CEFA] opacity-40 animate-float-slow" 
                 style={{ animationDelay: "0.8s" }} />
            <div className="absolute bottom-12 right-24 w-3 h-3 rounded-full bg-[#FFB6C1] opacity-40 animate-float-slow" 
                 style={{ animationDelay: "2.2s" }} />
            
            {/* Animated title */}
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B94] via-[#8B5CF6] to-[#3B82F6] animate-text-shimmer flex items-center justify-center relative">
              <span className="mr-2 inline-block animate-bounce-gentle" style={{ animationDelay: "0s" }}>✨</span>
              <span className="inline-block transition-all hover:scale-105">Not</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">quite</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">right?</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">Let</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">us</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">improve</span>
              <span className="mx-1 inline-block transition-all hover:scale-105">it!</span>
              <span className="ml-2 inline-block animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>✨</span>
            </h3>
            
            {/* Custom styles for animations */}
            <style jsx>{`
              @keyframes gradient-x {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              @keyframes gradient-x-reverse {
                0%, 100% { background-position: 100% 50%; }
                50% { background-position: 0% 50%; }
              }
              @keyframes float-slow {
                0%, 100% { transform: translateY(0) translateX(0); }
                50% { transform: translateY(-10px) translateX(5px); }
              }
              @keyframes bounce-gentle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
              }
              @keyframes text-shimmer {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes spin-slow-reverse {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
              }
              @keyframes twinkle-star {
                0%, 100% { opacity: 0.2; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              .animate-text-shimmer {
                background-size: 200% auto;
                animation: text-shimmer 4s ease infinite;
              }
              .animate-bounce-gentle {
                animation: bounce-gentle 2s infinite;
              }
              .animate-float-slow {
                animation: float-slow 6s ease-in-out infinite;
              }
              .animate-spin-slow {
                animation: spin-slow 12s linear infinite;
              }
              .animate-spin-slow-reverse {
                animation: spin-slow-reverse 10s linear infinite;
              }
              .animate-twinkle-star {
                animation: twinkle-star 3s ease-in-out infinite;
              }
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            
            {/* Previous feedback with enhanced styling */}
            {feedbackHistory.length > 0 && (
              <div className="mb-5 relative z-10">
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <span className="mr-2 w-4 h-4 bg-gradient-to-r from-[#FFB6C1] to-[#b19bff] rounded-full inline-block"></span>
                  Previous Feedback:
                </h4>
                <div className="space-y-2">
                  {feedbackHistory.map((feedback, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-md text-sm text-gray-600 italic border border-[#FFB6C1]/30 shadow-sm bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-300"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      &ldquo;{feedback}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            )}
          
            {/* Enhanced textarea with gradient focus */}
            <Textarea
              value={modificationFeedback}
              onChange={(e) => setModificationFeedback(e.target.value)}
              placeholder={imageCount > 1 
                ? "Describe what you'd like to change for all images... (e.g., 'Make all backgrounds more colorful', 'Add shining stars to all images')" 
                : "Describe what you'd like to change... (e.g., 'Make the background more colorful', 'Add a shining star', 'Add more decorations')"}
              className="w-full border-2 border-[#FFC0CB] rounded-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b19bff] focus:shadow-[0_0_0_1px_rgba(177,155,255,0.4),0_0_0_4px_rgba(177,155,255,0.1)] transition-all duration-300 mb-4 relative z-10"
              rows={3}
            />
          
            {/* Enhanced buttons with animation */}
            <div className="flex space-x-4 relative z-10">
              <Button 
                onClick={handleGenerateCard} 
                disabled={isLoading || !modificationFeedback.trim()} 
                className="bg-gradient-to-r from-[#FFC0CB] to-[#FFB6C1] hover:from-[#FFD1DC] hover:to-[#FFC0CB] text-[#4A4A4A] transition-all duration-300 flex-1 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="animate-pulse mr-2">✨</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Update {imageCount > 1 ? 'Images' : 'Card'}
                  </>
                )}
              </Button>
            
              <Button 
                onClick={handleResetFeedback}
                variant="outline" 
                className="border-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFF5F6] transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      )}

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
    </>
  )
}