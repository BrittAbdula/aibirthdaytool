'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
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
import ImageViewer from '@/components/ImageViewer'
import { extractTextFromSvg } from '@/lib/utils'
import { CardType, getCardConfig, getAllCardTypes, CardConfig } from '@/lib/card-config'
// Flickering Grid component
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
      <Label htmlFor="age">Age (Optional)</Label>
      <div className="flex items-center space-x-4">
        <Slider
          id="age-slider"
          min={0}
          max={120}
          step={1}
          value={[age || 0]}
          onValueChange={handleSliderChange}
          className="flex-grow custom-slider text-base"
        />
        <Input
          id="age-input"
          type="number"
          min={0}
          max={120}
          value={age === null ? '' : age}
          onChange={handleInputChange}
          className="w-16 text-center"
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

export default function CardGenerator({ wishCardType, initialTemplate }: { wishCardType: CardType, initialTemplate: string | null }) {
  const [currentCardType, setCurrentCardType] = useState<CardType>(wishCardType)
  const [currentTemplate, setCurrentTemplate] = useState<string>(initialTemplate || '')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const sampleCard = `/card/${wishCardType}.svg`

  useEffect(() => {
    setCurrentCardType(wishCardType)
  }, [wishCardType])

  const cardConfig = getCardConfig(currentCardType)

  // useEffect(() => {
  //   fetch('/card/1.svg')
  //     .then(response => response.text())
  //     .then(svgContent => setSvgContent(svgContent))
  //     .catch(error => console.error('load default svg failed:', error))
  // }, [])

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCardTypeChange = (newCardType: CardType) => {
    router.push(`/${newCardType}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSvgContent(null)
    setError(null)
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardType: currentCardType,
          templateId: currentTemplate,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      const data = await response.json();
      if (data.svgContent) {
        setSvgContent(data.svgContent);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error('No SVG content received');
      }
    } catch (error) {
      console.error("Error generating card:", error)
      setSvgContent(null)
      setError(error instanceof Error ? error.message : 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field: CardConfig['fields'][0]) => {
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
          />
        )
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={2}
            className="resize-none text-base"
          />
        )
      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleInputChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'age':
        return (
          <AgeSelector
            age={formData[field.name] || null}
            setAge={(value: number | null) => handleInputChange(field.name, value || '')}
          />
        )
      default:
        return null
    }
  }

  if (!cardConfig) {
    return <div>Invalid card type</div>
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 bg-[#FFF9F0]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
        <Card className="p-4 sm:p-6 bg-white border border-[#FFC0CB] shadow-md w-full max-w-md relative">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">{cardConfig.title}</CardTitle>
            <CardDescription className="text-[#4A4A4A]">Fill in your custom card details</CardDescription>
            <div className="absolute top-2 right-2">
              <Select value={currentCardType} onValueChange={handleCardTypeChange}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-transparent border-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  {getAllCardTypes().map((cardType) => (
                    <SelectItem key={cardType.type} value={cardType.type}>{cardType.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cardConfig.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
            {showAdvancedOptions && cardConfig.advancedFields && (
              <>
                {cardConfig.advancedFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {renderField(field)}
                  </div>
                ))}
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
            <Button className="w-full bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]" onClick={handleSubmit} disabled={isLoading}>
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
          <div className="bg-white p-3 sm:p-5 rounded-lg shadow-lg flex items-center justify-center relative border border-[#FFC0CB] aspect-[2/3]">
            {isLoading ? (
              <FlickeringGrid />
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {svgContent ? (
                  <ImageViewer svgContent={svgContent} alt={extractTextFromSvg(svgContent || 'Generated Card')} />
                ) : (
                  <Image
                    src={sampleCard}
                    alt={`Default ${wishCardType} Card`}
                    width={400}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}