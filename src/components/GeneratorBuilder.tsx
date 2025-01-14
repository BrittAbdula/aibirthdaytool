'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Field {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder: string
  optional: boolean
  options?: string[]
}

export default function GeneratorBuilder() {
  const [generatorName, setGeneratorName] = useState('')
  const [fields, setFields] = useState<Field[]>([])
  const [promptTemplate, setPromptTemplate] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const addField = () => {
    setFields([...fields, {
      name: '',
      label: '',
      type: 'text',
      placeholder: '',
      optional: false,
      options: []
    }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/generators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: generatorName,
          slug: generatorName.toLowerCase().replace(/\s+/g, '-'),
          title: generatorName,
          label: generatorName,
          fields: fields,
          promptContent: promptTemplate
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save generator');
      }
  
      // 成功后重定向或显示成功消息
    //   router.push('/cards');
    } catch (error) {
      console.error('Error saving generator:', error);
      // 显示错误消息
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8 border border-[#FFC0CB]">
        <CardHeader>
          <CardTitle>Generator Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="generatorName">Generator Name</Label>
            <Input
              id="generatorName"
              value={generatorName}
              onChange={(e) => setGeneratorName(e.target.value)}
              placeholder="e.g., Wedding Anniversary Cards"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Input Fields</Label>
            <div className="space-y-4 mt-2">
              {fields.map((field, index) => (
                <Card key={index} className="p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        placeholder="e.g., recipientName"
                      />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Recipient's Name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: any) => updateField(index, { type: value })}
                      >
                        <SelectTrigger>
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
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeField(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={addField}
                className="w-full border-dashed border-2"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Add Field
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="promptTemplate">AI Prompt Template</Label>
            <Textarea
              id="promptTemplate"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Create an SVG card with the following specifications..."
              className="mt-1 h-32"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
          className="border-[#FFC0CB] text-[#4A4A4A]"
        >
          Preview Generator
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]"
        >
          Save Generator
        </Button>
      </div>
    </div>
  )
} 