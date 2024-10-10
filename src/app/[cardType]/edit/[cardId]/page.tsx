'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { extractEditableFields, updateSvgContent } from '@/lib/utils'
import NextImage from 'next/image'
import { DownloadIcon, CopyIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { recordUserAction } from '@/lib/action'
import dynamic from 'next/dynamic'

const IsMobileWrapper = dynamic(() => import('@/components/IsMobileWrapper'), { ssr: false })

export default function EditCard({ params }: { params: { cardId: string, cardType: string } }) {
  const router = useRouter()
  const { cardId, cardType } = params
  const [svgContent, setSvgContent] = useState('')
  const [editableFields, setEditableFields] = useState<Record<string, string>>({})
  const [imageSrc, setImageSrc] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
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

    fetchCardData()
  }, [cardId])

  const updateImageSrc = (content: string) => {
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`
    setImageSrc(dataUrl)
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    const updatedFields = { ...editableFields, [fieldName]: value }
    setEditableFields(updatedFields)
    const updatedSvgContent = updateSvgContent(svgContent, updatedFields)
    setSvgContent(updatedSvgContent)
    updateImageSrc(updatedSvgContent)
  }

  const convertSvgToPng = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject('Error loading SVG')
      img.src = imageSrc
    })
  }

  const handleCopy = async () => {
    try {
      const pngDataUrl = await convertSvgToPng()
      const blob = await fetch(pngDataUrl).then(res => res.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast({ description: "Image copied" })
      await recordUserAction(cardId, 'copy')
    } catch (err) {
      console.error('Copy failed: ', err)
      toast({
        variant: "destructive",
        description: "Copy failed. Try long-press.",
      })
    }
  }

  const handleDownload = async (isMobile: boolean) => {
    if (isMobile) {
      toast({
        description: "Long-press to save image",
        duration: 3000,
      });
      await recordUserAction(cardId, 'download')
      return;
    }

    try {
      const pngDataUrl = await convertSvgToPng()
      const link = document.createElement('a')
      link.href = pngDataUrl
      link.download = `${cardType}_card.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ description: "Image downloaded" })
      await recordUserAction(cardId, 'download')
    } catch (err) {
      console.error('Download failed: ', err)
      toast({
        variant: "destructive",
        description: "Download failed. Try again.",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 bg-[#FFF9F0]">
      <h1 className="text-3xl font-bold mb-6 text-[#4A4A4A]">Edit {cardType} Card</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A]">Preview</h2>
          <div className="border border-[#FFC0CB] rounded-lg overflow-hidden">
            {imageSrc && (
              <NextImage
                src={imageSrc}
                alt={`${cardType} card preview`}
                width={400}
                height={600}
                className="w-full h-auto"
              />
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A]">Edit Text</h2>
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
          <div className="flex justify-between mt-6">
            <Button onClick={handleCopy} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <IsMobileWrapper>
              {(isMobile) => (
                <Button onClick={() => handleDownload(isMobile)} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isMobile ? "Save" : "Download"}
                </Button>
              )}
            </IsMobileWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}