'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DownloadIcon, CopyIcon, Pencil1Icon, PaperPlaneIcon, TwitterLogoIcon, EnvelopeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { isMobile } from 'react-device-detect'
import { recordUserAction } from '@/lib/action'
import { useRouter } from 'next/navigation'
import CardDisplay from './CardDisplay'

interface ImageViewerProps {
  alt: string
  cardId: string
  cardType: string
  isNewCard: boolean
  imgUrl?: string
}

export function ImageViewer({ alt, cardId, cardType, imgUrl, isNewCard }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [showPreview, setShowPreview] = useState(false)

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
      img.src = imgUrl || ''
    })
  }


  const handleDownload = async () => {
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
      link.download = 'mewtrucard.png'
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

  const handleEdit = () => {
    router.push(`/${cardType}/edit/${cardId}/`)
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
      case 'email':
        url = `mailto:?body=${encodeURIComponent(shareLink)}`
        break
    }
    window.open(url, '_blank')
  }


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative w-full h-full flex items-center justify-center cursor-pointer group">
                <img
                  src={imgUrl}
                  alt={alt}
                  width={400}
                  height={600}
                  className="max-w-full max-h-full"
                />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <div className="flex flex-col items-center justify-center h-full">
            {!showPreview ? (
              <div className="relative w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
              <img
                src={imgUrl}
                alt={alt}
                className="max-w-full max-h-full"
              />
              </div>
            ) : (
              <div className="w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center">
                <CardDisplay 
                  card={{
                    cardId: cardId,
                    cardType: cardType,
                    r2Url: imgUrl
                  }}
                />
              </div>
            )}
            <div className="flex justify-between p-4 bg-white w-full border-t border-[#ada9a9]">
              {isNewCard ? (
                <div className="w-full max-w-md mx-auto flex gap-4 justify-center">
                  <Button onClick={handleEdit} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                    <Pencil1Icon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button onClick={handleEdit} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                    <PaperPlaneIcon className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                  <Button 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
                  >
                  <>
                    <EyeOpenIcon className="mr-2 h-4 w-4" />
                    Preview
                  </>
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto flex gap-4 justify-center">
                  <Button onClick={handleEdit} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                    <Pencil1Icon className="mr-2 h-4 w-4" />
                    customize this template
                  </Button>
                  <Button 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors"
                  >
                  <>
                    <EyeOpenIcon className="mr-2 h-4 w-4" />
                    Preview
                  </>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
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
    </>
  )
}