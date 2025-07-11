'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { extractEditableFields, updateSvgContent, cn, fetchSvgContent } from '@/lib/utils'
import NextImage from 'next/image'
import { DownloadIcon, CopyIcon, PaperPlaneIcon, TwitterLogoIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { recordUserAction } from '@/lib/action'
import dynamic from 'next/dynamic'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import SpotifySearch from '@/components/SpotifySearch'
import { CardType } from '@/lib/card-config'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RecommendedCards } from '@/components/RecommendedCards'
import { useSession } from 'next-auth/react'
import { PremiumModal } from '@/components/PremiumModal'
import { Crown } from "lucide-react"

const IsMobileWrapper = dynamic(() => import('@/components/IsMobileWrapper'), { ssr: false })

export default function EditCardClient({ params }: { params: { cardId: string, cardType: CardType } }) {
  const { cardId, cardType } = params
  const [svgContent, setSvgContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [originalCardId, setOriginalCardId] = useState('')
  const [editableFields, setEditableFields] = useState<Record<string, string>>({})
  const [imageSrc, setImageSrc] = useState<string>('')

  // Helper function to determine if URL is a video
  const isVideo = (url?: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [editedCardId, setEditedCardId] = useState('')
  const [selectedMusic, setSelectedMusic] = useState<{ id: string; name: string; artist: string } | null>(null)
  const [enableMusic, setEnableMusic] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [enableCustomUrl, setEnableCustomUrl] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [relationship, setRelationship] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [requirements, setRequirements] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false)
  const { data: session } = useSession()
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsPremiumUser((session as any).user?.plan === 'PREMIUM')
    } else {
      setIsPremiumUser(false)
    }
  }, [session])

  useEffect(() => {
    if (showPremiumTooltip) {
      const timer = setTimeout(() => {
        setShowPremiumTooltip(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showPremiumTooltip])

  useEffect(() => {
    const fetchCardData = async () => {
      if (cardId === '1') {
        setIsLoading(true)
        try {
          const content = await fetchSvgContent('https://store.celeprime.com/' + cardType + '.svg')
          if (content) {
            setSvgContent(content)
            setOriginalContent(content)
            setOriginalCardId('1')
            setRelationship('')
            setMessage('')
            setEditableFields(extractEditableFields(content))
            updateImageSrc(content)
          } else {
            throw new Error('Failed to fetch SVG content')
          }
        } catch (error) {
          console.error('Error fetching template SVG:', error)
          toast({
            variant: "destructive",
            description: "Failed to load template. Please try again.",
          })
        } finally {
          setIsLoading(false)
        }
        return
      }
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cards/${cardId}?cardType=${cardType}`)
        if (response.ok) {
          const data = await response.json()
          const content = data.editedContent
          setSvgContent(content)
          setOriginalContent(content)
          setOriginalCardId(data.originalCardId)
          setRelationship(data.relationship)
          setRecipientName(data.recipientName)
          setSenderName(data.senderName)
          setMessage(data.message)
          setRequirements(data.requirements)
          setIsPublic(data.isPublic)
          setEditableFields(extractEditableFields(content))
          if (content) {
            updateImageSrc(content)
          } else {
            setImageSrc(data.r2Url)
          }
        } else {
          console.error('Failed to fetch card data')
        }
      } catch (error) {
        console.error('Error fetching card data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCardData()
  }, [])

  const updateImageSrc = useCallback((content: string) => {
    if (typeof window === 'undefined') return
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`
    setImageSrc(dataUrl)
  }, [])

  const handleFieldChange = (fieldName: string, value: string) => {
    const updatedFields = { ...editableFields, [fieldName]: value }
    setEditableFields(updatedFields)
    const updatedSvgContent = updateSvgContent(svgContent, updatedFields)
    setSvgContent(updatedSvgContent)
    updateImageSrc(updatedSvgContent)
  }

  const convertSvgToPng = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If it's a video, just return the video URL directly
      if (isVideo(imageSrc)) {
        resolve(imageSrc)
        return
      }

      if (!imageSrc.startsWith('data:image/svg+xml')) {
        // If it's not an SVG (likely an r2Url), just return the image source
        resolve(imageSrc)
        return
      }

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = 2.5
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        resolve(canvas.toDataURL('image/png', 1.0))
      }
      img.onerror = () => reject('Error loading SVG')
      img.src = imageSrc
    })
  }

  const handleCopy = async () => {
    try {
      const mediaUrl = await convertSvgToPng()
      
      // For videos, copy the URL to clipboard instead of the video itself
      if (isVideo(mediaUrl)) {
        await navigator.clipboard.writeText(mediaUrl)
        toast({ description: "Video URL copied" })
      } else {
        const blob = await fetch(mediaUrl).then(res => res.blob())
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        toast({ description: "Image copied" })
      }
      
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
      try {
        const mediaUrl = await convertSvgToPng()
        const link = document.createElement('a')
        link.href = mediaUrl
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          description: isVideo(mediaUrl) ? "Long-press on the video to save" : "Long-press on the image to save",
          duration: 5000,
        });
        await recordUserAction(cardId, 'download')
      } catch (err) {
        console.error('Mobile download failed:', err)
        toast({
          variant: "destructive",
          description: isVideo(imageSrc) ? "Failed to open video. Try again." : "Failed to open image. Try again.",
        })
      }
      return;
    }

    try {
      const mediaUrl = await convertSvgToPng()
      const link = document.createElement('a')
      link.href = mediaUrl
      
      if (isVideo(mediaUrl)) {
        link.download = `${cardType}_card.mp4`
        toast({ description: "Video downloaded" })
      } else {
        link.download = `${cardType}_card.png`
        toast({ description: "High quality image downloaded" })
      }
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
    setIsSending(true)
    try {
      if (svgContent === originalContent && editedCardId && !customUrl) {
        const shareUrl = editedCardId ?
          `${window.location.origin}/to/${customUrl || editedCardId}` :
          `${window.location.origin}/`
        setShareLink(shareUrl)
        setIsModalOpen(true)
        return
      }

      const response = await fetch('/api/edited-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editedCardId,
          cardType,
          originalCardId: originalCardId,
          editedContent: svgContent,
          r2Url: imageSrc,
          spotifyTrackId: enableMusic ? selectedMusic?.id : null,
          customUrl: enableCustomUrl ? customUrl : null,
          relationship: relationship,
          recipientName: recipientName,
          senderName: senderName,
          message: message,
          requirements: requirements,
          isPublic: isPublic,
        }),
      })

      if (response.ok) {
        const { id, customUrl: responseCustomUrl } = await response.json()
        setEditedCardId(id)
        const shareUrl = `${window.location.origin}/to/${responseCustomUrl || id}`
        setShareLink(shareUrl)
        setOriginalContent(svgContent)
        setIsModalOpen(true)
        await recordUserAction(cardId, 'send')

        toast({
          description: responseCustomUrl ?
            `Card created with custom URL: ${responseCustomUrl}` :
            "Card created successfully",
        })
      } else {
        throw new Error('Failed to save edited card')
      }
    } catch (error) {
      console.error('Error sending card:', error)
      toast({
        variant: "destructive",
        description: "Failed to send card. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast({ description: "Link copied to clipboard" })
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
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

  const handlePublicToggle = (checked: boolean) => {
    if (!checked && !isPremiumUser) {
      // User is trying to set to private but is not premium
      setShowPremiumTooltip(true)
      setTimeout(() => {
        setIsPremiumModalOpen(true)
      }, 300)
      return
    }
    setIsPublic(checked)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] via-[#FFF5F7] to-[#FFF0F5] py-6 sm:py-8">
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

          {/* Edit Section */}
          <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-[#4A4A4A] text-center flex items-center justify-center gap-2">
              <span className="text-pink-400">✏️</span>
              Customize Your Card
              <span className="text-pink-400">✏️</span>
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

              {/* Custom URL Section */}
              <div className="mt-8 pt-4 border-t border-pink-100">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">
                    Custom URL
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-muted-foreground">
                      Enable custom URL
                    </Label>
                    <Switch
                      checked={enableCustomUrl}
                      onCheckedChange={setEnableCustomUrl}
                      className="data-[state=checked]:bg-pink-400"
                    />
                  </div>
                </div>

                {enableCustomUrl && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {window.location.origin}/to/
                      </span>
                      <Input
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="your-custom-url"
                        className="flex-1 bg-white/50 border-2 border-pink-100 rounded-xl focus:ring-pink-200 focus:border-pink-300"
                      />
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      Only letters, numbers, and hyphens are allowed. Custom URLs are not permanently reserved and may be overwritten if used by others.
                    </p>
                  </div>
                )}
              </div>

              {/* Public Visibility Section */}
              <div className="mt-8 pt-4 border-t border-pink-100">
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">
                      Public Visibility
                    </Label>
                    {!isPremiumUser && (
                      <div className="relative">
                        <Crown className="h-4 w-4 text-amber-500" />
                        {showPremiumTooltip && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                            This is a premium feature. Please upgrade to a premium plan to access it.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-muted-foreground">
                      {isPublic ? "Public" : "Private"}
                    </Label>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={handlePublicToggle}
                      className="data-[state=checked]:bg-pink-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Desktop/Large only) */}
            <div className="flex-col gap-3 mt-8 hidden lg:flex sm:flex-row">
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
                disabled={isSending}
                className={cn(
                  "flex-1 text-white shadow-md hover:shadow-lg transition-all duration-300",
                  isSending
                    ? "bg-pink-800 cursor-wait"
                    : "bg-gradient-to-r from-pink-600 to-pink-700 hover:opacity-90"
                )}
              >
                <PaperPlaneIcon className={cn(
                  "mr-2 h-4 w-4",
                  isSending && "animate-spin"
                )} />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>

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
                {isLoading ? (
                  <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                ) : (
                  <div className="relative aspect-[2/3] flex items-center justify-center">
                    {imageSrc && (
                      isVideo(imageSrc) ? (
                        <video
                          src={imageSrc}
                          controls
                          autoPlay
                          muted
                          loop
                          className="w-full h-auto transform transition-transform duration-300 group-hover:scale-[1.02] object-contain"
                          onLoadedData={() => setIsLoading(false)}
                        >
                          <source src={imageSrc} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <NextImage
                          src={imageSrc}
                          alt={`${cardType} card preview`}
                          width={400}
                          height={600}
                          className="w-full h-auto transform transition-transform duration-300 group-hover:scale-[1.02]"
                          priority
                          loading="eager"
                          onLoadingComplete={() => setIsLoading(false)}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Personal Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message that will appear with your card..."
                  className="w-full bg-white/50 border-2 border-pink-100 rounded-xl focus:ring-pink-200 focus:border-pink-300 transition-all duration-300"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Music</label>
                  <p className="text-xs text-muted-foreground">Add a song to make your card more special</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground">Enable music</label>
                  <Switch
                    checked={enableMusic}
                    onCheckedChange={setEnableMusic}
                    className="data-[state=checked]:bg-pink-400"
                  />
                </div>
              </div>
              {enableMusic && (
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
              )}
            </div>

            {/* Action Buttons (Mobile only) */}
            <div className="flex flex-col gap-3 mt-8 lg:hidden">
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
                disabled={isSending}
                className={cn(
                  "flex-1 text-white shadow-md hover:shadow-lg transition-all duration-300",
                  isSending
                    ? "bg-pink-800 cursor-wait"
                    : "bg-gradient-to-r from-pink-600 to-pink-700 hover:opacity-90"
                )}
              >
                <PaperPlaneIcon className={cn(
                  "mr-2 h-4 w-4",
                  isSending && "animate-spin"
                )} />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        {/* <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-pink-200 to-transparent opacity-70"></div> */}

        {/* Recommended Products Section */}
        {/* <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg mb-8">
          <RecommendedCards cardType={cardType} />
        </div> */}

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
                  <span
                    className={cn(
                      "transition-opacity duration-500",
                      isCopied ? "opacity-100" : "opacity-100"
                    )}
                  >
                    {isCopied ? "Copy Success!" : "Copy Link"}
                  </span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Modal */}
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onOpenChange={setIsPremiumModalOpen}
        />
      </div>
    </div>
  )
}