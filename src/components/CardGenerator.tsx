'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2, Crown, AlertCircle, Info, ChevronRight, ChevronLeft, Check, Sparkles, Wand2 } from 'lucide-react'
import { useCardGeneration } from '@/hooks/useCardGeneration'
import { PremiumModal } from '@/components/PremiumModal'
import { modelConfigs, type ModelConfig } from '@/lib/model-config'
import { stylePresets, getPresetsForFormat, type OutputFormat } from '@/lib/style-presets'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const MagicalCardCreation = () => {
  const [loadingText, setLoadingText] = useState("Weaving your magical words...");
  const [progress, setProgress] = useState(0);
  
  // Progress simulation
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
  const [currentCardType, setCurrentCardType] = useState<CardType>(wishCardType)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [imageCount, setImageCount] = useState<number>(1)
  const router = useRouter()
  const sampleCard = `/card/goodluck.svg`
  const [submited, setSubmited] = useState(false)
  const [customValues, setCustomValues] = useState<Record<string, string>>({})
  const [selectedSize, setSelectedSize] = useState('portrait')
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(
    modelConfigs.find(m => m.id === 'Free_Image') || modelConfigs[0]
  )
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('image')
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<'base' | 'pro'>('base')
  const [styleDialogOpen, setStyleDialogOpen] = useState(false)
  const [styleSearch, setStyleSearch] = useState('')
  const [uploadedRefUrls, setUploadedRefUrls] = useState<string[]>([])
  const [isRefUploading, setIsRefUploading] = useState(false)
  const [refError, setRefError] = useState<string | null>(null)
  const refPhotoInputRef = useRef<HTMLInputElement>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [isPrivateCard, setIsPrivateCard] = useState(false)
  const [errorToast, setErrorToast] = useState<{title: string; message: string; type: 'error' | 'warning' | 'info'} | null>(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [creditsStatus, setCreditsStatus] = useState<any | null>(null);
  const [isClaimingCredits, setIsClaimingCredits] = useState(false);
  const pendingAuthRef = useRef<boolean>(false)
  const [savedFormData, setSavedFormData] = useState<any | null>(null)
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 4;

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

  // Existing logic for auth, effects, etc.
  useEffect(() => {
    setCurrentCardType(wishCardType)
    const initialFormData: Record<string, any> = {};
    cardConfig.fields.forEach(field => {
      if (field.type === 'select' && !field.optional && field.defaultValue) {
        initialFormData[field.name] = field.defaultValue;
      }
    });
    setFormData(initialFormData);
    const defaultImgUrl = cardConfig.isSystem ? `https://store.celeprime.com/${wishCardType}.svg` : sampleCard;
    initializeImageStates(imageCount, defaultImgUrl);
  }, [wishCardType, cardConfig, sampleCard, imageCount, initializeImageStates]);

  useEffect(() => {
    if (pendingAuthRef.current && session && savedFormData) {
      pendingAuthRef.current = false;
      setFormData(savedFormData.formData);
      setCustomValues(savedFormData.customValues);
      setSelectedSize(savedFormData.selectedSize);
      if (savedFormData.selectedModel) setSelectedModel(savedFormData.selectedModel);
      setIsPrivateCard(savedFormData.isPrivate ?? false);
      setShowAuthDialog(false);
      setTimeout(() => handleGenerateCard(), 500);
    }
  }, [session, savedFormData, setShowAuthDialog]);

  useEffect(() => {
    if (session?.user) setIsPremiumUser((session as any).user?.plan === 'PREMIUM');
    else setIsPremiumUser(false);
  }, [session]);

  const pickDefaultModelForFormat = (fmt: OutputFormat): ModelConfig => {
    if (fmt === 'video') return modelConfigs.find(m => m.format === 'video' && m.tier === 'Premium' && m.id.includes('Fast')) || modelConfigs[0];
    if (fmt === 'image') return modelConfigs.find(m => m.format === 'image' && m.tier === 'Free') || modelConfigs[0];
    return modelConfigs.find(m => m.format === 'svg' && m.tier === 'Free') || modelConfigs[0];
  };

  const getTierOptionsForFormat = (fmt: OutputFormat) => {
    if (fmt === 'svg') return { base: modelConfigs.find(m => m.id === 'Free_SVG') || pickDefaultModelForFormat('svg'), pro: modelConfigs.find(m => m.id === 'Premium_SVG') };
    if (fmt === 'image') return { base: modelConfigs.find(m => m.id === 'Free_Image') || pickDefaultModelForFormat('image'), pro: modelConfigs.find(m => m.id === 'Premium_Image') };
    return { base: modelConfigs.find(m => m.id === 'Premium_Video_Fast') || pickDefaultModelForFormat('video'), pro: modelConfigs.find(m => m.id === 'Premium_Video_Pro') };
  };

  useEffect(() => { setSelectedFormat(prev => selectedModel?.format || prev); }, []);

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
  }, [selectedFormat, selectedTier]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerateCard = async () => {
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
  };

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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!cardConfig) return <div>Invalid card type</div>

  return (
    <>
      <div className="min-h-screen bg-warm-cream pb-24 lg:pb-0">
        <GlassCard className="max-w-4xl mx-auto my-8 p-0 overflow-hidden shadow-2xl bg-white/80 border-white/60">
          
          {/* Progress Header */}
          <div className="bg-white/50 border-b border-orange-100/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-caveat font-bold text-gray-800">
                Create Magical Card <span className="text-base font-sans font-normal text-gray-500 ml-2">Step {currentStep} of {TOTAL_STEPS}</span>
              </h1>
              <div className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                {currentStep === 1 ? 'Format' : currentStep === 2 ? 'Details' : currentStep === 3 ? 'Message' : 'Magic'}
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-primary to-warm-coral transition-all duration-500 ease-out" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left/Top Panel: Inputs */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 space-y-6 overflow-y-auto max-h-[70vh] lg:max-h-[800px]">
              
              {/* Step 1: Format & Type */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-2">
                     <Label className="text-lg font-bold text-gray-800">Choose Format</Label>
                     <Tabs value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as OutputFormat)} className="w-full">
                       <TabsList className="grid w-full grid-cols-3 h-14 bg-orange-50/50 p-1 rounded-xl">
                         <TabsTrigger value="svg" className="rounded-lg h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Animated</TabsTrigger>
                         <TabsTrigger value="image" className="rounded-lg h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Static</TabsTrigger>
                         <TabsTrigger value="video" className="rounded-lg h-12 data-[state=active]:bg-white data-[state=active]:shadow-warm">Video</TabsTrigger>
                       </TabsList>
                     </Tabs>
                   </div>
                   
                   <div className="space-y-2">
                      <Label className="text-lg font-bold text-gray-800">Card Occasion</Label>
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

                   {/* Model Selection Simplified */}
                   <div className="space-y-2">
                      <Label className="text-lg font-bold text-gray-800">Quality Tier</Label>
                      <div className="grid grid-cols-1 gap-3">
                         {(() => {
                            const tiers = getTierOptionsForFormat(selectedFormat);
                            return (
                              <>
                                <div onClick={() => setSelectedTier('base')} 
                                     className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between", selectedTier === 'base' ? "border-primary bg-primary/5" : "border-transparent bg-gray-50 hover:bg-gray-100")}>
                                   <div>
                                     <div className="font-bold text-gray-800">{tiers.base.name}</div>
                                     <div className="text-xs text-gray-500">{tiers.base.time} • Balanced</div>
                                   </div>
                                   {selectedTier === 'base' && <Check className="text-primary w-5 h-5"/>}
                                </div>
                                <div onClick={() => setSelectedTier('pro')} 
                                     className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between", selectedTier === 'pro' ? "border-primary bg-primary/5" : "border-transparent bg-gray-50 hover:bg-gray-100", !tiers.pro && "opacity-50 cursor-not-allowed")}>
                                   <div>
                                     <div className="font-bold text-gray-800 flex items-center">{tiers.pro?.name || "Pro"} <Crown className="w-3 h-3 ml-1 text-amber-500"/></div>
                                     <div className="text-xs text-gray-500">{tiers.pro?.time || "N/A"} • High Quality</div>
                                   </div>
                                   {selectedTier === 'pro' && <Check className="text-primary w-5 h-5"/>}
                                </div>
                              </>
                            )
                         })()}
                      </div>
                   </div>
                </div>
              )}

              {/* Step 2: Recipient Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Who is this for?</h2>
                    <p className="text-gray-500">Tell us about the lucky person</p>
                  </div>
                  {['to', 'relationship', 'recipientName', 'age'].map(fieldName => {
                    const field = cardConfig.fields.find(f => f.name === fieldName);
                    return field ? renderField(field) : null;
                  })}
                </div>
              )}

              {/* Step 3: Message & Tone */}
              {currentStep === 3 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">The Message</h2>
                      <p className="text-gray-500">Customize the heartfelt words</p>
                    </div>
                    {['message', 'tone', 'language', 'signed'].map(fieldName => {
                      const field = cardConfig.fields.find(f => f.name === fieldName);
                      // Fallbacks if config is missing common fields
                      if (!field && fieldName === 'message') return (
                         <div key="message" className="space-y-2">
                           <Label className="font-medium">Message</Label>
                           <Textarea 
                              value={formData['message']||''} 
                              onChange={e=>handleInputChange('message', e.target.value)}
                              placeholder="Describe what you want to say..." 
                              className="text-base min-h-[120px]"
                           />
                         </div>
                      );
                      if (!field && fieldName === 'signed') return (
                        <div key="signed" className="space-y-2">
                          <Label className="font-medium">Signed (Optional)</Label>
                          <Input 
                            value={formData['signed']||''}
                            onChange={e=>handleInputChange('signed', e.target.value)}
                            placeholder="e.g. Your Bestie"
                            className="bg-white/50"
                          />
                        </div>
                      )
                      return field ? renderField(field) : null;
                    })}
                 </div>
              )}

              {/* Step 4: Finalize */}
              {currentStep === 4 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Add some Magic</h2>
                      <p className="text-gray-500">Final touches before generation</p>
                    </div>
                    
                    {/* Style Selector (Static only) */}
                    {selectedFormat === 'image' && (
                       <GlassCard className="p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors" onClick={() => setStyleDialogOpen(true)}>
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Wand2 size={20}/></div>
                             <div>
                                <div className="font-bold text-gray-700">Visual Style</div>
                                <div className="text-xs text-gray-500">{selectedStyleId ? stylePresets.find(s=>s.id===selectedStyleId)?.name : 'Auto (Smart Choice)'}</div>
                             </div>
                          </div>
                          <ChevronRight className="text-gray-400"/>
                       </GlassCard>
                    )}

                    {/* Design Field (Color/Desc) */}
                    {renderField({ name: 'design', label: 'Color / Theme Details', type: 'select', optional: true, options: ['Pastel', 'Vibrant', 'Minimalist', 'Watercolor'] } as any)}

                    {/* Reference Image */}
                    {selectedFormat !== 'svg' && (
                       <div className="space-y-2">
                          <Label className="font-medium">Reference Photo (Optional)</Label>
                          <div className={cn("border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 cursor-pointer transition-colors bg-white/50", uploadedRefUrls.length > 0 && "border-primary bg-primary/5")} onClick={() => refPhotoInputRef.current?.click()}>
                             <input ref={refPhotoInputRef} type="file" className="hidden" onChange={async (e) => {
                                 // Simple inline upload handler logic from original
                                 const file = e.target.files?.[0];
                                 if(!file) return;
                                 setIsRefUploading(true);
                                 try {
                                    const fd = new FormData(); fd.append('file', file); fd.append('uploadPath', 'images/user-uploads'); fd.append('fileName', file.name);
                                    const res = await fetch('/api/reference/upload', {method:'POST', body:fd});
                                    const data = await res.json();
                                    if(data?.data?.downloadUrl) setUploadedRefUrls([data.data.downloadUrl]);
                                 } catch(err) { console.error(err); } finally { setIsRefUploading(false); }
                             }}/>
                             {isRefUploading ? <Loader2 className="animate-spin mx-auto text-primary"/> : uploadedRefUrls.length ? <img src={uploadedRefUrls[0]} className="h-20 mx-auto object-contain rounded"/> : <div className="text-sm text-gray-500">Tap to upload a photo</div>}
                          </div>
                       </div>
                    )}

                    {/* Privacy Toggle */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                       <div className="flex items-center gap-2">
                          <Label className="cursor-pointer">Public Gallery</Label>
                          {!isPremiumUser && <Crown size={14} className="text-amber-500"/>}
                       </div>
                       <Switch checked={!isPrivateCard} onCheckedChange={(c) => { if(c || isPremiumUser) setIsPrivateCard(!c); else setIsPremiumModalOpen(true); }} />
                    </div>
                 </div>
              )}
            </div>

            {/* Right Panel: Preview / Actions */}
            <div className="w-full lg:w-1/2 bg-gray-50/50 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
               <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                  {/* Result Display */}
                  {imageStates[0]?.isLoading ? (
                     <div className="w-full max-w-sm aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative">
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
                  ) : (
                     <div className="text-center opacity-50">
                        <div className="w-48 h-64 bg-gray-200 rounded-xl mx-auto mb-4 animate-pulse"></div>
                        <p className="text-sm">Your masterpiece will appear here</p>
                     </div>
                  )}
               </div>

               <div className="mt-8 flex gap-3">
                  {currentStep > 1 && (
                     <WarmButton variant="outline" onClick={prevStep} className="flex-1" disabled={isLoading}>
                        Back
                     </WarmButton>
                  )}
                  {currentStep < TOTAL_STEPS ? (
                     <WarmButton onClick={nextStep} className="flex-[2]" disabled={isLoading}>
                        Next Step <ChevronRight size={16} className="ml-2"/>
                     </WarmButton>
                  ) : (
                     <WarmButton onClick={handleGenerateCard} className="flex-[2] py-6 text-lg shadow-warm hover:shadow-warm-lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                        Generate Magic
                     </WarmButton>
                  )}
               </div>
            </div>
          </div>
        </GlassCard>
      </div>

       {/* Modals */}
       <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogTitle>Sign in Required</DialogTitle>
          <DialogDescription>Please sign in to generate your card.</DialogDescription>
          <Button onClick={handleLogin} disabled={isAuthLoading}>
            {isAuthLoading ? <Loader2 className="animate-spin"/> : 'Sign in with Google'}
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
                     <img src={p.sample} className="absolute inset-0 w-full h-full object-cover"/>
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white text-sm font-bold">{p.name}</div>
                  </div>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </>
  )
}

