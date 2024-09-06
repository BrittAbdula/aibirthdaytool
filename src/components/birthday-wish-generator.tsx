'use client'
import React, { useState } from 'react'
import { Gift, Cake, PartyPopper } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function BirthdayWishGenerator() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [message, setMessage] = useState('')
  const [customUrl, setCustomUrl] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically call your LLM API to generate the personalized blessing
    console.log('Generating birthday wish for:', { name, age, message })
  }

  return (
    <div className="min-h-screen bg-[#faf7e8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-black text-white px-2">CREATE A</span>
          </h1>
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-[#ff6b6b] text-white px-2">BIRTHDAY</span>
          </h1>
          <h1 className="text-5xl font-bold">
            <span className="bg-[#4ecdc4] text-white px-2">CARD!</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                placeholder="Enter custom message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customUrl"
                checked={customUrl}
                onCheckedChange={(checked) => setCustomUrl(checked as boolean)}
              />
              <label
                htmlFor="customUrl"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Get a custom URL for $0.99!
              </label>
            </div>
            <Button type="submit" className="w-full bg-[#a364d9] hover:bg-[#8a4bbd]">
              CREATE
            </Button>
          </div>
        </form>
      </div>

      <div className="fixed top-4 left-4">
        <Gift className="w-12 h-12 text-[#ff6b6b]" />
      </div>
      <div className="fixed top-4 right-4">
        <Cake className="w-12 h-12 text-[#ffa502]" />
      </div>
      <div className="fixed bottom-4 left-4">
        <PartyPopper className="w-12 h-12 text-[#ff6b6b]" />
      </div>
      <div className="fixed bottom-4 right-4">
        <Gift className="w-12 h-12 text-[#4ecdc4]" />
      </div>
    </div>
  )
}