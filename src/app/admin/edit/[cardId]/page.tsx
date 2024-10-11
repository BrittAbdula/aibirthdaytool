'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { extractEditableFields, updateSvgContent } from '@/lib/utils'
import NextImage from 'next/image'
import { useToast } from "@/hooks/use-toast"

export default function AdminEditCard({ params }: { params: { cardId: string } }) {
  const { cardId } = params
  const [svgContent, setSvgContent] = useState('')
  const [editableFields, setEditableFields] = useState<Record<string, string>>({})
  const [imageSrc, setImageSrc] = useState<string>('')
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchCardData()
    }
  }, [isAuthenticated, cardId])

  const fetchCardData = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}`)
      if (response.ok) {
        const data = await response.json()
        setSvgContent(data.responseContent)
        setEditableFields(extractEditableFields(data.responseContent))
        updateImageSrc(data.responseContent)
      } else {
        console.error('Failed to fetch card data')
      }
    } catch (error) {
      console.error('Error fetching card data:', error)
    }
  }

  const updateImageSrc = (content: string) => {
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`
    setImageSrc(dataUrl)
  }

  const handleFieldChange = async (fieldName: string, value: string) => {
    const updatedFields = { ...editableFields, [fieldName]: value }
    setEditableFields(updatedFields)
    const updatedSvgContent = updateSvgContent(svgContent, updatedFields)
    setSvgContent(updatedSvgContent)
    updateImageSrc(updatedSvgContent)

    // 自动保存更改
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responseContent: updatedSvgContent }),
      })

      if (!response.ok) {
        console.error('Failed to save changes')
        toast({
          variant: "destructive",
          description: "Failed to save changes",
        })
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast({
        variant: "destructive",
        description: "Error saving changes",
      })
    }
  }

  const handleAuthenticate = async () => {
    // 这里应该调用一个 API 端点来验证密码
    // 为了演示，我们使用一个硬编码的密码
    if (password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      toast({
        variant: "destructive",
        description: "Invalid password",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Authentication</h1>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="mb-4"
        />
        <Button onClick={handleAuthenticate}>Authenticate</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-[#FFF9F0]">
      <h1 className="text-3xl font-bold mb-6 text-[#4A4A4A]">Admin Edit Card</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A]">Preview</h2>
          <div className="border border-[#FFC0CB] rounded-lg overflow-hidden">
            {imageSrc && (
              <NextImage
                src={imageSrc}
                alt="Card preview"
                width={400}
                height={600}
                className="w-full h-auto"
              />
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A]">Edit Text (Auto-save enabled)</h2>
          {Object.entries(editableFields).map(([fieldName, value]) => (
            <div key={fieldName} className="mb-4">
              <label htmlFor={fieldName} className="block mb-2 font-medium text-[#4A4A4A]">{fieldName}</label>
              <Textarea
                id={fieldName}
                value={value}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                className="w-full border-[#FFC0CB] focus:ring-[#FFD1DC] focus:border-[#FFD1DC]"
                rows={value.split('\n').length}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}