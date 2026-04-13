'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { WarmButton } from "@/components/ui/warm-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageViewer } from '@/components/ImageViewer'
import { cn, fetchSvgContent } from '@/lib/utils'
import { CardType, CardConfig, CARD_SIZES } from '@/lib/card-config'
import { useSession, signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Crown, AlertCircle, ChevronRight, Check, Sparkles, Wand2, ChevronDown } from 'lucide-react'
import { useCardGeneration } from '@/hooks/useCardGeneration'
import { PremiumModal } from '@/components/PremiumModal'
import { modelConfigs, type ModelConfig } from '@/lib/model-config'
import { stylePresets, getPresetsForFormat, type OutputFormat } from '@/lib/style-presets'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { getSeoCardTypeLabel } from '@/lib/seo'

const MagicalCardCreation = () => {
  const [loadingText, setLoadingText] = useState("Weaving your magical words...");
  const [progress, setProgress] = useState(0);
  
  // Progress simulation
  // Resume the saved generation attempt after authentication restores session state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 95) return 95;
        // Slow down as we get closer to 100
        const increment = Math.max(0.5, (100 - old) / 20);
        return old + increment;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);
  
  // Text rotation
  useEffect(() => {
    const messages = [
      "Weaving your magical words... ✨",
      "Mixing rainbow colors... 🎨",
      "Sprinkling stardust... 🌟",
      "Asking AI fairies... 🧚‍♀️",
      "Almost ready... 🎁",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-warm-cream via-pink-50 to-blue-50 flex items-center justify-center">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center">
         {/* Card Container */}
         <div className="relative w-48 h-64 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-[0_0_50px_10px_rgba(255,192,203,0.3)] overflow-hidden animate-float-dreamy">
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent w-[200%] h-full animate-shimmer-slide"></div>
            
            {/* Progress Circular Indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative">
                  {/* Outer Ring */}
                  <svg className="w-24 h-24 transform -rotate-90">
                     <circle cx="48" cy="48" r="40" stroke="rgba(255, 182, 193, 0.2)" strokeWidth="4" fill="transparent" />
                     <circle 
                        cx="48" cy="48" r="40" 
                        stroke="url(#gradient)" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray="251.2" 
                        strokeDashoffset={251.2 * (1 - progress / 100)} 
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                     />
                     <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#FF6B6B" />
                           <stop offset="100%" stopColor="#FFB4A8" />
                        </linearGradient>
                     </defs>
                  </svg>
                  
                  {/* Center Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg animate-pulse-soft">
                        <Sparkles className="w-8 h-8 text-warm-coral animate-spin-slow-reverse" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Decor */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-pink-100/50 to-transparent"></div>
         </div>

         {/* Loading Text */}
         <div className="mt-8 text-center space-y-2">
            <h3 className="text-xl font-caveat font-bold text-gray-800 animate-fade-in">{loadingText}</h3>
            <div className="flex items-center justify-center gap-1">
               <span className="w-2 h-2 bg-warm-coral rounded-full animate-bounce delay-0"></span>
               <span className="w-2 h-2 bg-warm-coral rounded-full animate-bounce delay-150"></span>
               <span className="w-2 h-2 bg-warm-coral rounded-full animate-bounce delay-300"></span>
            </div>
         </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes float-dreamy { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer-slide { 0% { transform: translateX(-150%) skewX(-15deg); } 100% { transform: translateX(150%) skewX(-15deg); } }
        @keyframes pulse-soft { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.05); } }
        @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </div>
  )
}

const AgeSelector = ({ age, setAge }: { age: number | null, setAge: (age: number | null) => void }) => {
  const handleSliderChange = (value: number[]) => { setAge(value[0] || null) }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value)
    if (value === null || (!isNaN(value) && value >= 0 && value <= 120)) { setAge(value) }
  }
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center space-x-6">
        <Slider id="age-slider" min={0} max={120} step={1} value={[age || 0]} onValueChange={handleSliderChange} className="flex-grow custom-slider" />
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 w-20 text-center font-bold text-gray-700">{age || 0}</div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 font-medium px-1"><span>Newborn</span><span>Adult</span><span>Elderly</span></div>
    </div>
  )
}

const pickDefaultModelForFormat = (fmt: OutputFormat): ModelConfig => {
  if (fmt === 'video') return modelConfigs.find(m => m.format === 'video' && m.tier === 'Premium' && m.id.includes('Fast')) || modelConfigs[0]
  if (fmt === 'image') return modelConfigs.find(m => m.format === 'image' && m.tier === 'Free') || modelConfigs[0]
  return modelConfigs.find(m => m.format === 'svg' && m.tier === 'Free') || modelConfigs[0]
}

const getTierOptionsForFormat = (fmt: OutputFormat) => {
  if (fmt === 'svg') return { base: modelConfigs.find(m => m.id === 'Free_SVG') || pickDefaultModelForFormat('svg'), pro: modelConfigs.find(m => m.id === 'Premium_SVG') }
  if (fmt === 'image') return { base: modelConfigs.find(m => m.id === 'Free_Image') || pickDefaultModelForFormat('image'), pro: modelConfigs.find(m => m.id === 'Premium_Image') }
  return { base: modelConfigs.find(m => m.id === 'Premium_Video_Fast') || pickDefaultModelForFormat('video'), pro: modelConfigs.find(m => m.id === 'Premium_Video_Pro') }
}

const CustomSelect = ({ value, onValueChange, placeholder, options, customValue, onCustomValueChange, required, label }: any) => {
  const [isCustom, setIsCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isCustom && inputRef.current) inputRef.current.focus(); }, [isCustom]);
  return (
    <div className="relative">
      {!isCustom ? (
        <Select value={value} onValueChange={(val) => { if (val === "custom") setIsCustom(true); else onValueChange(val); }} required={required && !isCustom}>
          <SelectTrigger className="w-full h-12 bg-white/50 border-orange-100/50 backdrop-blur-sm focus:ring-primary/20"><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" className="text-primary font-medium">✨ Custom {label}</SelectItem>
            {options.map((option: string) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
          </SelectContent>
        </Select>
      ) : (
        <div className="relative animate-in fade-in zoom-in duration-200">
          <Input ref={inputRef} value={customValue} onChange={(e) => { onCustomValueChange(e.target.value); onValueChange(e.target.value); }} placeholder={`Enter custom ${label.toLowerCase()}`} className="pr-10 border-primary focus-visible:ring-primary h-12 bg-white" required={required} />
          <Button type="button" variant="ghost" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-full" onClick={() => { setIsCustom(false); onCustomValueChange(""); onValueChange(""); }}>×</Button>
        </div>
      )}
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
  const AUTH_DRAFT_KEY = 'mewtrucard.authDraft.v1'
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const searchParamString = searchParams.toString()
  const [currentCardType, setCurrentCardType] = useState<CardType>(wishCardType)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [imageCount, setImageCount] = useState<number>(1)
  const router = useRouter()
  const sampleCard = `/card/goodluck.svg`
  const [submited, setSubmited] = useState(false)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [selectedSize, setSelectedSize] = useState('portrait')
  const defaultSelectedModel = modelConfigs.find(m => m.id === 'Free_Image') || modelConfigs[0]
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(defaultSelectedModel)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(defaultSelectedModel.format)
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<'base' | 'pro'>('base')
  const [styleDialogOpen, setStyleDialogOpen] = useState(false)
  const [uploadedRefUrls, setUploadedRefUrls] = useState<string[]>([])
  const [isRefUploading, setIsRefUploading] = useState(false)
  const refPhotoInputRef = useRef<HTMLInputElement>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [isPrivateCard, setIsPrivateCard] = useState(false)
  const [errorToast, setErrorToast] = useState<{title: string; message: string; type: 'error' | 'warning' | 'info'} | null>(null);
  const pendingAuthRef = useRef<boolean>(false)
  const generateAfterAuthRef = useRef<(() => void) | null>(null)
  const [savedFormData, setSavedFormData] = useState<any | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 3;

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

  const error = generationError || null;
  const isLoading = globalLoading;

  const cardTypeOptions = React.useMemo(() => {
    const defaults = ['birthday','anniversary','valentine','sorry','thank-you','congratulations','love','get-well','graduation','wedding','holiday','baby'];
    const withCurrent = [wishCardType, ...defaults].filter(Boolean) as string[];
    return Array.from(new Set(withCurrent));
  }, [wishCardType]);

  const normalizedRelationship = React.useMemo(() => {
    const params = new URLSearchParams(searchParamString);
    const rawValue = params.get('relationship') || params.get('to') || '';
    return rawValue
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }, [searchParamString]);

  const prefilledValues = React.useMemo(() => {
    const params = new URLSearchParams(searchParamString);
    const signedValue = params.get('signed') || params.get('senderName') || '';
    const recipientValue = params.get('recipientName') || '';
    const messageValue = params.get('message') || '';

    return {
      ...(normalizedRelationship && { relationship: normalizedRelationship, to: normalizedRelationship }),
      ...(recipientValue && { recipientName: recipientValue }),
      ...(signedValue && { signed: signedValue, senderName: signedValue }),
      ...(messageValue && { message: messageValue }),
    };
  }, [normalizedRelationship, searchParamString]);

  // Existing logic for auth, effects, etc.
  useEffect(() => {
    setCurrentCardType(wishCardType)
    const initialFormData: Record<string, any> = {};
    cardConfig.fields.forEach(field => {
      if (field.type === 'select' && !field.optional && field.defaultValue) {
        initialFormData[field.name] = field.defaultValue;
      }
    });
    setFormData({ ...initialFormData, ...prefilledValues });
    const defaultImgUrl = cardConfig.isSystem ? `https://store.celeprime.com/${wishCardType}.svg` : sampleCard;
    initializeImageStates(imageCount, defaultImgUrl);
  }, [wishCardType, cardConfig, sampleCard, imageCount, initializeImageStates, prefilledValues]);

  useEffect(() => {
    if (pendingAuthRef.current && session && savedFormData) {
      pendingAuthRef.current = false;
      setFormData(savedFormData.formData);
      setCustomValues(savedFormData.customValues);
      setSelectedSize(savedFormData.selectedSize);
      if (savedFormData.selectedModel) setSelectedModel(savedFormData.selectedModel);
      setIsPrivateCard(savedFormData.isPrivate ?? false);
      setShowAuthDialog(false);
      const timeout = window.setTimeout(() => generateAfterAuthRef.current?.(), 500);
      return () => window.clearTimeout(timeout);
    }
  }, [session, savedFormData, setShowAuthDialog]);

  useEffect(() => {
    if (session?.user) setIsPremiumUser((session as any).user?.plan === 'PREMIUM');
    else setIsPremiumUser(false);
  }, [session]);

  useEffect(() => {
    if (!selectedFormat) return;
    const tiers = getTierOptionsForFormat(selectedFormat);
    const nextModel = selectedTier === 'pro' && tiers.pro ? tiers.pro : tiers.base;
    setSelectedModel(nextModel);
    if (selectedFormat === 'svg') setSelectedStyleId(null);
    else if (selectedStyleId) {
      const style = stylePresets.find(s => s.id === selectedStyleId);
      if (style && !style.formats.includes(selectedFormat)) setSelectedStyleId(null);
    }
  }, [selectedFormat, selectedStyleId, selectedTier]);

  useEffect(() => {
    const previewUrl = imageStates[0]?.url
    if (globalLoading || (previewUrl && previewUrl !== initialImgUrl)) {
      setShowMobilePreview(true)
    }
  }, [globalLoading, imageStates, initialImgUrl]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsRefUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('uploadPath', 'images/user-uploads')
      fd.append('fileName', file.name)

      const res = await fetch('/api/reference/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data?.data?.downloadUrl) {
        setUploadedRefUrls([data.data.downloadUrl])
      }
    } catch (uploadError) {
      console.error(uploadError)
      setErrorToast({
        title: 'Upload failed',
        message: 'We could not upload that reference image. Try a different file.',
        type: 'warning'
      })
    } finally {
      setIsRefUploading(false)
      e.target.value = ''
    }
  }

  const getMissingFieldsForStep = () => {
    if (currentStep !== 2) return [];

    return ['to', 'relationship', 'recipientName']
      .map((fieldName) => cardConfig.fields.find((field) => field.name === fieldName))
      .filter((field): field is NonNullable<typeof cardConfig.fields[number]> => Boolean(field && !field.optional))
      .filter((field) => {
        const value = formData[field.name];
        return typeof value !== 'string' || value.trim().length === 0;
      });
  };

  const handleGenerateCard = React.useCallback(async () => {
    if (!session) {
      setSavedFormData({ formData: { ...formData }, customValues: { ...customValues }, selectedSize, selectedModel, isPrivate: isPrivateCard });
      pendingAuthRef.current = true;
      setIsPremiumUser(false);
      setShowAuthDialog(true);
      return;
    }

    const options = {
      cardType: currentCardType,
      size: selectedSize,
      modelId: selectedModel.id,
      formData: { ...formData, isPublic: !isPrivateCard },
      imageCount: 1, // Force 1 for simplicity in wizard
      referenceImageUrls: uploadedRefUrls,
      styleId: selectedFormat === 'image' ? (selectedStyleId || undefined) : undefined,
      outputFormat: selectedFormat
    };

    try {
      const result = await generateCards(options);
      if (result.success) setSubmited(true);
      else if (result.error === 'rate_limit') setErrorToast({ title: 'Daily Limit Reached', message: 'Free users can generate 1 card per day.', type: 'warning' });
      else setErrorToast({ title: 'Generation Failed', message: result.error || 'Error generating card', type: 'error' });
    } catch (err) {
      setErrorToast({ title: 'System Error', message: 'Something went wrong', type: 'error' });
    }
  }, [
    currentCardType,
    customValues,
    formData,
    generateCards,
    isPrivateCard,
    selectedFormat,
    selectedModel,
    selectedSize,
    selectedStyleId,
    session,
    setShowAuthDialog,
    uploadedRefUrls,
  ]);

  useEffect(() => {
    generateAfterAuthRef.current = () => {
      void handleGenerateCard()
    }
  }, [handleGenerateCard])

  const handleLogin = async () => {
    try {
      setIsAuthLoading(true);
      await signIn('google', { callbackUrl: window.location.href });
    } catch (error) { setIsAuthLoading(false); }
  }

  const renderField = (field: CardConfig['fields'][0]) => {
    const isRequired = !field.optional;
    const labelClass = `${isRequired ? 'after:content-["*"] after:ml-0.5 after:text-primary font-medium text-gray-700' : 'font-medium text-gray-700'}`;
    
    // Filter out fields not relevant to current format
    if (Array.isArray((field as any).formats) && !(field as any).formats.includes(selectedFormat)) return null;

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
              className="text-base h-12 bg-white/50 border-orange-100/50 backdrop-blur-sm focus:ring-primary/20"
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
              rows={3}
              className="resize-none text-base bg-white/50 border-orange-100/50 backdrop-blur-sm focus:ring-primary/20 min-h-[100px]"
              required={isRequired}
            />
          );
        case 'select':
          return (
            <CustomSelect
              value={formData[field.name] || ''}
              onValueChange={(value: string) => handleInputChange(field.name, value)}
              customValue={customValues[field.name] || ''}
              onCustomValueChange={(value: string) => setCustomValues(prev => ({ ...prev, [field.name]: value }))}
              placeholder={field.placeholder?.replace('(optional)', '')}
              options={field.options || []}
              required={isRequired}
              label={field.label}
            />
          );
        case 'age':
          return <AgeSelector age={formData[field.name] || null} setAge={(value) => handleInputChange(field.name, value || '')} />;
        default: return null;
      }
    })();

    return (
      <div key={field.name} className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
        {field.label && <Label htmlFor={field.name} className={labelClass}>{field.label}</Label>}
        {inputComponent}
      </div>
    );
  }

  const nextStep = () => {
    const missingFields = getMissingFieldsForStep();
    if (missingFields.length > 0) {
      setErrorToast({
        title: 'Missing details',
        message: `Add ${missingFields.map((field) => field.label).join(', ')} before continuing.`,
        type: 'warning'
      });
      return;
    }

    setErrorToast(null);
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const seoCardLabel = getSeoCardTypeLabel(currentCardType)
  const qualityOptions = getTierOptionsForFormat(selectedFormat)
  const stepMeta = [
    {
      label: 'Setup',
      title: 'Choose format, occasion, and quality',
      description: 'Start with the fastest path to a card you can share.',
    },
    {
      label: 'Recipient',
      title: 'Tell us who this card is for',
      description: 'A few details help the first draft feel personal.',
    },
    {
      label: 'Message',
      title: 'Write the message and review advanced options',
      description: 'Keep it simple or add extra art direction before you generate.',
    },
  ] as const
  const activeStep = stepMeta[currentStep - 1]
  const generatorTitle = currentCardType === 'birthday'
    ? 'Birthday Card Maker'
    : `${seoCardLabel} Card Maker`
  const finalActionLabel = isLoading
    ? 'Generating card...'
    : 'Generate card'
  const hasGeneratedPreview = Boolean(imageStates[0]?.url) && imageStates[0]?.url !== initialImgUrl
  const shouldRenderPreview = showMobilePreview || hasGeneratedPreview || Boolean(imageStates[0]?.isLoading)

  const renderActionButtons = (mobile = false) => (
    <div className={cn("flex items-center gap-3", mobile && "w-full")}>
      {currentStep > 1 && (
        <WarmButton
          variant="outline"
          onClick={prevStep}
          className={cn("flex-1", mobile && "h-12")}
          disabled={isLoading}
        >
          Back
        </WarmButton>
      )}
      {currentStep < TOTAL_STEPS ? (
        <WarmButton
          onClick={nextStep}
          className={cn(currentStep > 1 ? "flex-[1.5]" : "flex-1", mobile && "h-12")}
          disabled={isLoading}
        >
          Continue
          <ChevronRight size={16} className="ml-2" />
        </WarmButton>
      ) : (
        <WarmButton
          onClick={handleGenerateCard}
          className={cn("flex-[1.6] py-6 text-base shadow-warm hover:shadow-warm-lg", mobile && "h-12 py-0 text-sm")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
          {finalActionLabel}
        </WarmButton>
      )}
    </div>
  )

  if (!cardConfig) return <div>Invalid card type</div>

  return (
    <>
      <div className="min-h-screen bg-warm-cream pb-28 lg:pb-0">
        <GlassCard className="mx-auto my-6 max-w-6xl border-white/70 bg-white/90 p-0 shadow-2xl">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
            <section className="p-5 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <div className="space-y-4 rounded-[28px] border border-orange-100/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-700">
                        <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold">
                          Step {currentStep} of {TOTAL_STEPS}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-gray-600">
                          {activeStep.label}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-serif font-semibold text-gray-900 sm:text-3xl">
                          {generatorTitle}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                          {activeStep.description}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-orange-800">
                      <div className="font-semibold">Task-first flow</div>
                      <div className="mt-1 text-orange-700/80">
                        Fill the form first, then generate when the draft feels ready.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {stepMeta.map((step, index) => {
                      const isActive = currentStep === index + 1
                      const isComplete = currentStep > index + 1
                      return (
                        <div
                          key={step.label}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-left transition-colors",
                            isActive && "border-primary bg-primary/8",
                            isComplete && "border-emerald-200 bg-emerald-50",
                            !isActive && !isComplete && "border-gray-200 bg-gray-50/70"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                              {step.label}
                            </span>
                            {isComplete && <Check className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-gray-800">
                            {step.title}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-warm-coral transition-all duration-500 ease-out"
                      style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-700">
                      Editable after generation
                    </span>
                    {(prefilledValues.recipientName || prefilledValues.relationship) && (
                      <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-700">
                        Prefilled for {prefilledValues.recipientName || 'your recipient'}
                        {prefilledValues.relationship ? ` • ${prefilledValues.relationship}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {errorToast && (
                  <Alert className={cn(
                    "border",
                    errorToast.type === 'error' && "border-red-200 bg-red-50 text-red-700",
                    errorToast.type === 'warning' && "border-amber-200 bg-amber-50 text-amber-800",
                    errorToast.type === 'info' && "border-blue-200 bg-blue-50 text-blue-800"
                  )}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-semibold">{errorToast.title}.</span> {errorToast.message}
                    </AlertDescription>
                  </Alert>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-3">
                      <Label className="text-lg font-bold text-gray-800">Choose format</Label>
                      <Tabs value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as OutputFormat)} className="w-full">
                        <TabsList className="grid h-14 w-full grid-cols-3 rounded-2xl bg-orange-50/70 p-1">
                          <TabsTrigger value="svg" className="rounded-xl h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Animated</TabsTrigger>
                          <TabsTrigger value="image" className="rounded-xl h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Image</TabsTrigger>
                          <TabsTrigger value="video" className="rounded-xl h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Video</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <p className="text-sm text-gray-500">
                        Pick the output that best matches how you want to send this card.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-bold text-gray-800">Card occasion</Label>
                      <CustomSelect
                        value={currentCardType}
                        onValueChange={(val: string) => setCurrentCardType(val as CardType)}
                        customValue={customValues['cardType'] || ''}
                        onCustomValueChange={(val: string) => setCustomValues(prev=>({...prev, cardType: val}))}
                        options={cardTypeOptions}
                        placeholder="Select occasion"
                        label="Occasion"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-bold text-gray-800">Quality tier</Label>
                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTier('base')}
                          className={cn(
                            "rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            selectedTier === 'base' ? "border-primary bg-primary/5" : "border-transparent bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-bold text-gray-800">{qualityOptions.base.name}</div>
                              <div className="mt-1 text-sm text-gray-500">{qualityOptions.base.time} • Faster first draft</div>
                            </div>
                            {selectedTier === 'base' && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!qualityOptions.pro) return
                            setSelectedTier('pro')
                          }}
                          disabled={!qualityOptions.pro}
                          className={cn(
                            "rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            selectedTier === 'pro' ? "border-primary bg-primary/5" : "border-transparent bg-gray-50 hover:bg-gray-100",
                            !qualityOptions.pro && "cursor-not-allowed opacity-55"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center font-bold text-gray-800">
                                {qualityOptions.pro?.name || "Pro"}
                                <Crown className="ml-1 h-3.5 w-3.5 text-amber-500" />
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {qualityOptions.pro?.time || "Premium only"} • Highest quality output
                              </div>
                            </div>
                            {selectedTier === 'pro' && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Recipient details</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        These details shape the tone, message, and examples the generator uses.
                      </p>
                    </div>
                    <div className="grid gap-5">
                      {['to', 'relationship', 'recipientName', 'age'].map(fieldName => {
                        const field = cardConfig.fields.find(f => f.name === fieldName);
                        return field ? renderField(field) : null;
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Message and finishing touches</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Write the core message first. Open advanced options only if you want extra art direction.
                      </p>
                    </div>

                    <div className="grid gap-5">
                      {['message', 'tone', 'language', 'signed'].map(fieldName => {
                        const field = cardConfig.fields.find(f => f.name === fieldName);
                        if (!field && fieldName === 'message') return (
                          <div key="message" className="space-y-2">
                            <Label className="font-medium text-gray-700">Message</Label>
                            <Textarea
                              value={formData['message'] || ''}
                              onChange={e=>handleInputChange('message', e.target.value)}
                              placeholder="Describe what you want to say..."
                              className="min-h-[140px] resize-none border-orange-100/60 bg-white/70 text-base"
                            />
                          </div>
                        );
                        if (!field && fieldName === 'signed') return (
                          <div key="signed" className="space-y-2">
                            <Label className="font-medium text-gray-700">Signed (optional)</Label>
                            <Input
                              value={formData['signed'] || ''}
                              onChange={e=>handleInputChange('signed', e.target.value)}
                              placeholder="e.g. Your Bestie"
                              className="h-12 border-orange-100/60 bg-white/70"
                            />
                          </div>
                        )
                        return field ? renderField(field) : null;
                      })}
                    </div>

                    <div className="overflow-hidden rounded-[24px] border border-orange-100/70 bg-orange-50/50">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedOptions((open) => !open)}
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-orange-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                            Advanced options
                          </div>
                          <div className="mt-1 text-base font-semibold text-gray-900">
                            Style, reference image, and gallery visibility
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Optional controls for extra direction. Skip this if you want the fastest path.
                          </p>
                        </div>
                        <ChevronDown className={cn("mt-1 h-5 w-5 text-gray-500 transition-transform", showAdvancedOptions && "rotate-180")} />
                      </button>

                      {showAdvancedOptions && (
                        <div className="space-y-5 border-t border-orange-100/70 px-5 py-5">
                          {selectedFormat === 'image' && (
                            <button
                              type="button"
                              className="flex w-full items-center justify-between rounded-2xl border border-purple-100 bg-white/85 p-4 text-left transition-colors hover:bg-white"
                              onClick={() => setStyleDialogOpen(true)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
                                  <Wand2 size={18} />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-700">Visual style</div>
                                  <div className="text-xs text-gray-500">
                                    {selectedStyleId ? stylePresets.find(s=>s.id===selectedStyleId)?.name : 'Auto (smart choice)'}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="text-gray-400" />
                            </button>
                          )}

                          {renderField({
                            name: 'design',
                            label: 'Art direction',
                            type: 'select',
                            optional: true,
                            options: ['Pastel', 'Vibrant', 'Minimalist', 'Watercolor']
                          } as any)}

                          {selectedFormat !== 'svg' && (
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Reference image (optional)</Label>
                              <button
                                type="button"
                                className={cn(
                                  "w-full rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-6 text-center transition-colors hover:border-primary/50",
                                  uploadedRefUrls.length > 0 && "border-primary bg-primary/5"
                                )}
                                onClick={() => refPhotoInputRef.current?.click()}
                              >
                                <input
                                  ref={refPhotoInputRef}
                                  type="file"
                                  className="hidden"
                                  onChange={handleReferenceUpload}
                                />
                                {isRefUploading ? (
                                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                                ) : uploadedRefUrls.length ? (
                                  <>
                                    {/* Uploaded URLs may come from arbitrary storage locations. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={uploadedRefUrls[0]} alt="Reference upload preview" className="mx-auto h-20 rounded object-contain" />
                                    <div className="mt-3 text-sm font-medium text-gray-700">Tap to replace reference image</div>
                                  </>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Upload a reference image</div>
                                    <div className="text-xs text-gray-500">Useful for matching a person, palette, or mood.</div>
                                  </div>
                                )}
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/85 p-4">
                            <div className="pr-4">
                              <div className="flex items-center gap-2 font-semibold text-gray-800">
                                Public gallery visibility
                                {!isPremiumUser && <Crown size={14} className="text-amber-500" />}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                Public cards can appear in idea galleries. Premium members can keep drafts private.
                              </p>
                            </div>
                            <Switch
                              checked={!isPrivateCard}
                              onCheckedChange={(checked) => {
                                if (checked || isPremiumUser) {
                                  setIsPrivateCard(!checked)
                                  return
                                }
                                setIsPremiumModalOpen(true)
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="hidden lg:block">
                  {renderActionButtons()}
                  <p className="mt-3 text-sm text-gray-500">
                    When your draft is ready, you can keep refining it, then share or download the final version.
                  </p>
                </div>
              </div>
            </section>

            <aside className="border-t border-gray-100 bg-gradient-to-br from-orange-50/50 via-white to-rose-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div className="space-y-5 lg:sticky lg:top-24">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                      Preview
                    </div>
                    <div className="mt-1 text-base font-semibold text-gray-900">
                      Stable card preview
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      The preview stays out of the way while you fill the form, then updates here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobilePreview((open) => !open)}
                    className="inline-flex h-10 items-center rounded-full border border-orange-200 bg-white px-4 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-50 lg:hidden"
                  >
                    {shouldRenderPreview ? 'Hide preview' : 'Show preview'}
                  </button>
                </div>

                <div className={cn(!shouldRenderPreview && "hidden lg:block", "rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-xl")}>
                  <div className="flex min-h-[300px] flex-col items-center justify-center">
                    {imageStates[0]?.isLoading ? (
                      <div className="relative aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl">
                        <MagicalCardCreation />
                      </div>
                    ) : imageStates[0]?.url ? (
                      <div className="w-full max-w-sm">
                        <ImageViewer
                          alt="Generated Card"
                          cardId={imageStates[0].id || '1'}
                          cardType={currentCardType}
                          imgUrl={imageStates[0].url}
                          isNewCard={true}
                          svgContent={imageStates[0].svgContent}
                        />
                      </div>
                    ) : initialImgUrl ? (
                      <div className="w-full max-w-sm">
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                          {/* Default generator preview should be visible in initial HTML for faster LCP discovery. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={initialImgUrl}
                            alt={`${seoCardLabel} card preview`}
                            width={400}
                            height={600}
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                            className="h-auto w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center opacity-60">
                        <div className="mx-auto mb-4 h-64 w-48 animate-pulse rounded-2xl bg-gray-200" />
                        <p className="text-sm text-gray-500">Your draft will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>

                {!shouldRenderPreview && (
                  <div className="rounded-[24px] border border-dashed border-orange-200 bg-white/70 p-5 text-sm text-gray-600 lg:hidden">
                    Preview is tucked below the fold until you need it, so you can stay focused on the form.
                  </div>
                )}

                <div className="rounded-[24px] border border-orange-100/70 bg-white/80 p-4 text-sm text-gray-600 shadow-sm">
                  <div className="font-semibold text-gray-800">What happens next</div>
                  <ul className="mt-3 space-y-2">
                    <li>1. Finish the form and click the primary action.</li>
                    <li>2. Your first draft is generated in the preview panel.</li>
                    <li>3. Keep editing, then share or download the final version.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </GlassCard>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100/80 bg-white/92 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium text-gray-600">
              <span>
                Step {currentStep} of {TOTAL_STEPS}: {activeStep.label}
              </span>
              <span>
                Ready to move to the next step
              </span>
            </div>
            {renderActionButtons(true)}
          </div>
        </div>
      </div>

       {/* Modals */}
       <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogTitle>Continue to generate</DialogTitle>
          <DialogDescription>Use your Google account to create and save this card.</DialogDescription>
          <Button onClick={handleLogin} disabled={isAuthLoading}>
            {isAuthLoading ? <Loader2 className="animate-spin"/> : 'Continue with Google'}
          </Button>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
         <DialogContent><DialogTitle>Limit Reached</DialogTitle><p>You have reached the daily limit.</p></DialogContent>
      </Dialog>

      <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />

      {/* Style Dialog Re-implementation */}
      <Dialog open={styleDialogOpen} onOpenChange={setStyleDialogOpen}>
         <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Choose a Style</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div onClick={() => { setSelectedStyleId(null); setStyleDialogOpen(false); }} className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border hover:border-primary">Auto</div>
               {getPresetsForFormat(selectedFormat).map(p => (
                  <div key={p.id} onClick={() => { setSelectedStyleId(p.id); setStyleDialogOpen(false); }} className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group">
                     {/* Style preset samples may come from mixed remote sources. */}
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={p.sample} alt={`${p.name} style sample`} className="absolute inset-0 w-full h-full object-cover"/>
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white text-sm font-bold">{p.name}</div>
                  </div>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </>
  )
}
