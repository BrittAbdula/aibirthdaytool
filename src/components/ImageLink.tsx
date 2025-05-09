'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DownloadIcon, CopyIcon, Pencil1Icon, PaperPlaneIcon, TwitterLogoIcon, EnvelopeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import NextImage from 'next/image'
import { isMobile } from 'react-device-detect'
import { recordUserAction } from '@/lib/action'
import { useRouter } from 'next/navigation'

interface ImageViewerProps {
  svgContent: string
  alt: string
  cardId: string
  cardType: string
}

export function ImageViewer({ svgContent, alt, cardId, cardType }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    setIsClient(true)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
    setImageSrc(dataUrl)
  }, [svgContent])

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

  const handleSend = async () => {
    try {
      const response = await fetch('/api/edited-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardType,
          originalCardId: cardId,
          editedContent: svgContent,
        }),
      })

      if (response.ok) {
        const { id } = await response.json()
        setShareLink(`${window.location.origin}/to/${id}`)
        setIsShareModalOpen(true)
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
          <div className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            {isClient && imageSrc && (
              <img
                src={imageSrc}
                alt={alt}
                width={400}
                height={600}
                className="max-w-full max-h-full"
              />
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-[#FFF9F0] border border-[#FFC0CB] p-0">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
              {isClient && imageSrc && (
                <img
                  src={imageSrc}
                  alt={alt}
                  width={400}
                  height={600}
                  className="max-w-full max-h-full"
                />
              )}
            </div>
            <div className="flex justify-between p-4 bg-white w-full border-t border-[#ada9a9]">
              <div className="w-full max-w-md mx-auto flex justify-between">
                <Button onClick={handleCopy} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                {/* <Button onClick={handleDownload} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isMobile ? "Save" : "Download"}
                </Button> */}
                <Button onClick={handleEdit} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <Pencil1Icon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSend} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <PaperPlaneIcon className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
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