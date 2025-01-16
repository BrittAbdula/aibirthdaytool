'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GeneratorField, GeneratorFormData } from '@/lib/types/generator'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Wand2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GeneratorBuilder() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<GeneratorFormData>({
    name: '',
    slug: '',
    title: '',
    label: '',
    description: '',
    fields: [
      {
        name: 'recipientName',
        label: "Recipient's Name",
        type: 'text',
        placeholder: 'Enter recipient name',
        optional: false
      },
      {
        name: 'relationship',
        label: 'Relationship',
        type: 'select',
        placeholder: 'Select relationship',
        options: [
          'Partner', 'Spouse', 'Crush', 'Myself', 'Friend',
          'Father', 'Mother', 'Wife', 'Husband', 'Boyfriend',
          'Girlfriend', 'Brother', 'Sister', 'Daughter',
          'Grandparent', 'Student', 'Classmate', 'Son', 'Other'
        ],
        optional: false,
        defaultValue: 'Partner'
      },
      {
        name: 'message',
        label: 'story (optional)',
        type: 'textarea',
        placeholder: 'Share your story...',
        optional: true
      },
      {
        name: 'senderName',
        label: 'Your Name (optional)',
        type: 'text',
        placeholder: 'Enter your name',
        optional: true
      }
    ],
    promptContent: ''
  })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [generatedSlug, setGeneratedSlug] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const updateFormData = (updates: Partial<GeneratorFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      // Auto-generate slug from name
      slug: updates.name ? updates.name.toLowerCase().replace(/\s+/g, '-') : prev.slug
    }))
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setIsSubmitting(true)

      // Validate required fields
      if (!formData.name?.trim()) {
        setError('Generator name is required')
        return
      }

      if (!formData.fields.length) {
        setError('At least one input field is required')
        return
      }

      // Validate field names and required properties
      const invalidFields = formData.fields.some(field => 
        !field.name?.trim() || !field.label?.trim()
      )
      if (invalidFields) {
        setError('All fields must have both name and label')
        return
      }

      // Prepare submission data
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        title: formData.name.trim(),  // Set title same as name
        label: formData.name.trim(),  // Set label same as name
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        fields: formData.fields.map(field => ({
          ...field,
          name: field.name.trim(),
          label: field.label || field.name, // Use name as label if not provided
          placeholder: field.placeholder || `Enter ${field.name}`,
        })),
        promptContent: formData.promptContent || `Generate a card for ${formData.name}`
      }

      const response = await fetch('/api/generators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save generator')
      }

      const data = await response.json()
      setGeneratedSlug(data.slug)
      setShowSuccessDialog(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save generator')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8 border border-[#FFC0CB]">
        <CardHeader>
          <CardTitle>Card Generator Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label 
              htmlFor="generatorName" 
              className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500"
            >
              Generator Name
            </Label>
            <Input
              id="generatorName"
              value={formData.name}
              onChange={(e) => {
                setError(null)
                updateFormData({ name: e.target.value })
              }}
              placeholder="e.g., Wedding Anniversary"
              className={`mt-1 h-10 ${!formData.name && 'border-red-300'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="Description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="Description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="e.g., Create beautiful anniversary cards for your loved ones."
              className="mt-1 min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Input Fields</Label>
              <Button
                variant="outline"
                onClick={() => updateFormData({ 
                  fields: [...formData.fields, { 
                    name: '', 
                    label: '', 
                    type: 'text', 
                    placeholder: '', 
                    optional: false 
                  }] 
                })}
                className="h-8 px-3 text-xs"
              >
                <PlusIcon className="mr-1 h-3 w-3" /> Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {formData.fields.map((field, index) => (
                <Card key={index} className="p-4 border border-gray-100 shadow-sm hover:border-[#FFC0CB] transition-colors">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-7 space-y-2">
                      <Label className="text-xs text-gray-500">Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateFormData({ 
                          fields: formData.fields.map((f, i) => 
                            i === index ? { ...f, name: e.target.value } : f
                          ) 
                        })}
                        placeholder="e.g., recipientName"
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-4 space-y-2">
                      <Label className="text-xs text-gray-500">Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: any) => updateFormData({ 
                          fields: formData.fields.map((f, i) => 
                            i === index ? { ...f, type: value } : f
                          ) 
                        })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-end justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFormData({ 
                          fields: formData.fields.filter((_, i) => i !== index) 
                        })}
                        className="h-9 hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] min-w-[200px] relative"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Create Generator
            </>
          )}
        </Button>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="border border-[#FFC0CB] shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#4A4A4A]">
              Generator Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your card generator is now ready to use. Share it with others using the link below:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${baseUrl}/${generatedSlug}/`}
                className="bg-gray-50"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${baseUrl}/${generatedSlug}/`)
                  toast.success('Link copied to clipboard!')
                }}
                className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]"
              >
                Copy Link
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push(`/${generatedSlug}/`)
              }}
              className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]"
            >
              Try It Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 