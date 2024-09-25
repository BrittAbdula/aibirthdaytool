'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import confetti from 'canvas-confetti'
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

// Flickering Grid 组件
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

const personalityTraitsOptions = [
  'Dependable', 'Loyal', 'Thoughtful', 'Supportive', 'Kind', 'Creative',
  'Energetic', 'Spontaneous', 'Adventurous', 'Full of Life',
  'Affectionate', 'Witty', 'Fun', 'Humorous', 'Smart', 'Beautiful'
]

const toneOptions = [
  'Sincere and Warm', 'Playful and Cute', 'Romantic and Poetic',
  'Lighthearted and Joyful', 'Inspirational and Encouraging', 'Thankful', 'Formal'
]

const bestWishesOptions = [
  'Success', 'Happiness', 'Good Health', 'Love and Joy',
  'Adventures', 'Career Advancement'
]

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
          className="flex-grow custom-slider"
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

export default function BirthdayCardGenerator() {
  const [cardType, setCardType] = useState('birthday')
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('Myself')
  const [tone, setTone] = useState('')
  const [bestWishes, setBestWishes] = useState('Happiness')
  const [senderName, setSenderName] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [age, setAge] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSvgContent(null)
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardType,
          name,
          age,
          relationship,
          bestWishes,
          senderName,
          additionalInfo
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 sm:py-12 bg-[#FFF9F0]">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-[#4A4A4A]">MewTruCard Generator</h1>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
        <Card className="p-4 sm:p-6 bg-white border border-[#FFC0CB] shadow-md w-full max-w-md relative">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">Create Your MewTruCard</CardTitle>
            <CardDescription className="text-[#4A4A4A]">Fill in your custom card details</CardDescription>
            <div className="absolute top-2 right-2">
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-transparent border-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Card</SelectItem>
                  <SelectItem value="love">Love Card</SelectItem>
                  <SelectItem value="congratulations">Congratulations Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">To</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Myself">Myself</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Wife">Wife</SelectItem>
                  <SelectItem value="Husband">Husband</SelectItem>
                  <SelectItem value="Boyfriend">Boyfriend</SelectItem>
                  <SelectItem value="Girlfriend">Girlfriend</SelectItem>
                  <SelectItem value="Brother">Brother</SelectItem>
                  <SelectItem value="Sister">Sister</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Recipient&apos;s Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {showAdvancedOptions && (
              <>
                <AgeSelector age={age} setAge={setAge} />
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone of the Message (Optional)</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bestWishes">Best Wishes (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {bestWishesOptions.map(wish => (
                      <label key={wish} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={wish}
                          name="bestWishes"
                          value={wish}
                          checked={bestWishes.includes(wish)}
                          onChange={() => setBestWishes(wish)}
                          className="hidden"
                        />
                        <span className={`px-4 py-2 rounded-full cursor-pointer ${bestWishes.includes(wish) ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-800'}`}>
                          {wish}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                   <Textarea
    id="additionalInfo"
                    placeholder="Anything you want to say or your Story"
    value={additionalInfo}
    onChange={(e) => setAdditionalInfo(e.target.value)}
    rows={2}
    className="resize-none"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name (Optional)</Label>
                  <Input
                    id="senderName"
                    placeholder="Enter your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end">
              <button
                className="text-[#FFC0CB] hover:text-[#FFD1DC] focus:outline-none"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
              </button>
            </div>
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
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <Image
                    src="/card/1.svg"
                    alt="Default Birthday Card"
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

      <section className="mt-24">
        <h2 className="text-3xl font-serif font-semibold mb-8 text-center text-[#4A4A4A]">Why Choose MewTruCard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <Card className="bg-white border border-[#FFC0CB]">
            <CardHeader>
              <CardTitle className="font-serif text-[#4A4A4A]">Personalized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A4A4A]">Create unique cards with custom messages and designs for your loved ones.</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#FFC0CB]">
            <CardHeader>
              <CardTitle className="font-serif text-[#4A4A4A]">Quick & Easy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A4A4A]">Generate beautiful cards in seconds with our user-friendly interface.</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-[#FFC0CB]">
            <CardHeader>
              <CardTitle className="font-serif text-[#4A4A4A]">Variety</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4A4A4A]">Choose from a wide range of card types for every occasion and celebration.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}