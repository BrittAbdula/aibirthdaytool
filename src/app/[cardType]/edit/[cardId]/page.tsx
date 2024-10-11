'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { extractEditableFields, updateSvgContent } from '@/lib/utils'
import NextImage from 'next/image'
import { DownloadIcon, CopyIcon, PaperPlaneIcon, TwitterLogoIcon, LinkedInLogoIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { recordUserAction } from '@/lib/action'
import dynamic from 'next/dynamic'
import { EyeOpenIcon } from '@radix-ui/react-icons'

const IsMobileWrapper = dynamic(() => import('@/components/IsMobileWrapper'), { ssr: false })

export default function EditCard({ params }: { params: { cardId: string, cardType: string } }) {
  const { cardId, cardType } = params
  const [svgContent, setSvgContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [editableFields, setEditableFields] = useState<Record<string, string>>({})
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [editedCardId, setEditedCardId] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}`)
        if (response.ok) {
          const data = await response.json()
          setSvgContent(data.responseContent)
          setOriginalContent(data.responseContent)
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

  const handleSend = async () => {
    if (svgContent === originalContent) {
      setShareLink(editedCardId ? `${window.location.origin}/to/${editedCardId}` : `${window.location.origin}/`)
      setIsModalOpen(true)
      return
    }
    try {
      const response = await fetch('/api/edited-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editedCardId,
          cardType,
          originalCardId: cardId,
          editedContent: svgContent,
        }),
      })

      if (response.ok) {
        const { id } = await response.json()
        setEditedCardId(id)
        setShareLink(`${window.location.origin}/to/${id}`)
        setOriginalContent(svgContent)
        setIsModalOpen(true)
        await recordUserAction(cardId, 'send')
      } else {
        throw new Error('Failed to save edited card')
      }
    } catch (error) {
      console.error('Error saving edited card:', error)
      toast({
        variant: "destructive",
        description: "Failed to generate share link. Please try again.",
      })
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast({ description: "Link copied to clipboard" })
  }

  const handleShare = (platform: string) => {
    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`
        break
      case 'email':
        url = `mailto:?body=${encodeURIComponent(shareLink)}`
        break
    }
    window.open(url, '_blank')
  }

  return (
    <div className="container mx-auto p-4 bg-[#FFF9F0]">
      <h1 className="text-3xl font-bold mb-6 text-[#4A4A4A]">Edit Your Personalized {cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A] text-center">Preview</h2>
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
            <Button onClick={handleSend} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
              <PaperPlaneIcon className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your card</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="p-2 bg-gray-100 rounded">
              <code className="text-sm font-mono break-all">{shareLink}</code>
            </div>
            <div className="mt-4 flex justify-between items-center space-x-2">
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
              >
                <TwitterLogoIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleShare('email')}
                className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
              >
                <EnvelopeClosedIcon className="h-4 w-4" />
              </Button>
                  <Button
                    onClick={() => window.open(shareLink, '_blank')}
                    className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
                  >
                    <EyeOpenIcon className="h-4 w-4" />
                  </Button>
              <Button
                onClick={handleCopyLink}
                className="flex-grow bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
              >
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}