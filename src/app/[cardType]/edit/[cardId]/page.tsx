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
import SpotifySearch from '@/components/SpotifySearch'
import { CardType } from '@/lib/card-config'


const IsMobileWrapper = dynamic(() => import('@/components/IsMobileWrapper'), { ssr: false })

export default function EditCard({ params }: { params: { cardId: string, cardType: CardType } }) {
  const { cardId, cardType } = params
  const [svgContent, setSvgContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [editableFields, setEditableFields] = useState<Record<string, string>>({})
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [editedCardId, setEditedCardId] = useState('')
  const [selectedMusic, setSelectedMusic] = useState<{ id: string; name: string; artist: string } | null>(null)
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
          spotifyTrackId: selectedMusic?.id
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] via-[#FFF5F7] to-[#FFF0F5] px-4 py-6 sm:py-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header Section */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#FF69B4] to-[#FF1493]">
            Design Your Perfect {cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card
          </h1>
          <p className="text-[#6B7280] text-lg sm:text-xl italic">
            Let your creativity shine ✨
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Preview Section */}
          <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-[#4A4A4A] text-center flex items-center justify-center gap-2">
              <span className="text-pink-400">✨</span>
              Preview
              <span className="text-pink-400">✨</span>
            </h2>
            <div className="relative group rounded-xl overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative border-2 border-pink-100 rounded-xl overflow-hidden">
                {imageSrc && (
                  <NextImage
                    src={imageSrc}
                    alt={`${cardType} card preview`}
                    width={400}
                    height={600}
                    className="w-full h-auto transform transition-transform duration-300 group-hover:scale-[1.02]"
                    priority
                  />
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Music
              </label>
              <SpotifySearch 
                cardType={cardType}
                onSelect={async (song) => {
                  console.log('Selected song:', song)
                  setSelectedMusic(song)
                  // Record the selection
                  try {
                    await fetch('/api/spotify/record-selection', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        cardType,
                        song
                      })
                    })
                  } catch (error) {
                    console.error('Failed to record song selection:', error)
                  }
                }}
              />
            </div>
          </div>

          {/* Edit Section */}
          <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-[#4A4A4A] text-center flex items-center justify-center gap-2">
              <span className="text-pink-400">✏️</span>
              Customize Text
            </h2>
            <div className="space-y-5">
              {Object.entries(editableFields).map(([fieldName, value]) => (
                <div key={fieldName} className="group transition-all duration-300">
                  <label 
                    htmlFor={fieldName} 
                    className="block mb-2 font-medium text-[#4A4A4A] group-hover:text-pink-500 transition-colors"
                  >
                    {fieldName.replace(/_/g, ' ')}
                  </label>
                  <Textarea
                    id={fieldName}
                    value={value}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    className="w-full bg-white/50 border-2 border-pink-100 rounded-xl focus:ring-pink-200 focus:border-pink-300 transition-all duration-300"
                    rows={value.split('\n').length}
                    placeholder={`Enter your message here...`}
                  />
                </div>
              ))}
            </div>

            

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button 
                onClick={handleCopy} 
                className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <CopyIcon className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <IsMobileWrapper>
                {(isMobile) => (
                  <Button 
                    onClick={() => handleDownload(isMobile)}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    {isMobile ? "Save" : "Download"}
                  </Button>
                )}
              </IsMobileWrapper>
              <Button 
                onClick={handleSend}
                className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <PaperPlaneIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Share Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-center text-[#4A4A4A]">
                Share Your Creation
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <code className="text-sm font-mono break-all text-[#4A4A4A]">{shareLink}</code>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => handleShare('twitter')}
                  className="bg-[#1DA1F2] text-white hover:opacity-90 transition-all duration-300"
                >
                  <TwitterLogoIcon className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleShare('email')}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:opacity-90 transition-all duration-300"
                >
                  <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button
                  onClick={() => window.open(shareLink, '_blank')}
                  className="bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:opacity-90 transition-all duration-300"
                >
                  <EyeOpenIcon className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={handleCopyLink}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white hover:opacity-90 transition-all duration-300"
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}