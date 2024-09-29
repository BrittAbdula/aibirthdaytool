'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DownloadIcon, CopyIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import NextImage from 'next/image'
import { isMobile } from 'react-device-detect';

interface ImageViewerProps {
  svgContent: string
  alt: string
}

export default function ImageViewer({ svgContent, alt }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
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
      toast({
        title: "Success",
        description: "Image copied to clipboard",
      })
    } catch (err) {
      console.error('Copy failed: ', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Copy failed. Please try again.",
      })
    }
  }

  const handleDownload = async () => {
    if (isMobile) {
      toast({
        title: "Save Image",
        description: "Long press the image and select 'Save Image' to download.",
        duration: 5000,
      });
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
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      })
    } catch (err) {
      console.error('Download failed: ', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Download failed. Please try again.",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <NextImage
              src={imageSrc}
              alt={alt}
              width={400}
              height={600}
              className="max-w-full max-h-full"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-[#FFF9F0] border border-[#FFC0CB] p-0">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
              <NextImage
                src={imageSrc}
                alt={alt}
                width={400}
                height={600}
                className="max-w-full max-h-full"
              />
            </div>
            <div className="flex justify-between p-4 bg-white w-full border-t border-[#ada9a9]">
              <div className="w-full max-w-md mx-auto flex justify-between">
                <Button onClick={handleCopy} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleDownload} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isMobile ? "Save to Album" : "Download"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}