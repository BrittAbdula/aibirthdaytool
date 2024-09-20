'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function BirthdayCardGenerator() {
  const [cardType, setCardType] = useState('birthday')
  const [name, setName] = useState('')
  const [svgContent, setSvgContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 加载初始SVG内容
    fetch('/card/1.svg')
      .then(response => response.text())
      .then(data => {
        setSvgContent(data)
      })
      .catch(error => {
        console.error('加载初始SVG时出错:', error)
        setSvgContent('<svg><text>无法加载初始卡片。</text></svg>')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardType, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      const data = await response.json();
      setSvgContent(data.svgContent);
    } catch (error) {
      console.error("Error generating card content:", error)
      setSvgContent("<svg><text>Sorry, we couldn't generate a card at this time. Please try again later.</text></svg>")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-purple-700">MewTruCard Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Create Your Card</CardTitle>
            <CardDescription>Fill in the details for your custom card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Card</SelectItem>
                  <SelectItem value="love">Love Card</SelectItem>
                  <SelectItem value="congratulations">Congratulations Card</SelectItem>
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
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Card'}
            </Button>
          </CardFooter>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Preview</h2>
          <div className="bg-white p-4 rounded-lg shadow-lg min-h-[600px] flex items-center justify-center">
            {svgContent ? (
              <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : (
              <p className="text-gray-500">Your card preview will appear here</p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold mb-6 text-center text-purple-700">Why Choose MewTruCard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Personalized</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create unique cards with custom messages and designs for your loved ones.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick & Easy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate beautiful cards in seconds with our user-friendly interface.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Variety</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Choose from a wide range of card types for every occasion and celebration.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}