'use client'
import React, { useState } from 'react'
import { Gift, Cake, PartyPopper } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function BirthdayCardGenerator() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [message, setMessage] = useState('')
  const [customUrl, setCustomUrl] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 这里您通常会调用LLM API来生成个性化祝福
    console.log('生成生日祝福：', { name, age, message })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-black text-white px-2">Create</span>
          </h1>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-[#ff6b6b] text-white px-2">Birthday</span>
          </h1>
          <h1 className="text-4xl font-bold">
            <span className="bg-[#4ecdc4] text-white px-2">Card!</span>
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
            <Button type="submit" className="w-full bg-[#a364d9] hover:bg-[#8a4bbd]">
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}