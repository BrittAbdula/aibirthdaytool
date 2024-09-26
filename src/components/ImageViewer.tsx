'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DownloadIcon, CopyIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ImageViewerProps {
  svgContent: string
  alt: string
}

export function ImageViewer({ svgContent, alt }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
      const svgElement = svgDoc.documentElement
      if (svgElement instanceof SVGSVGElement) {
        svgRef.current = svgElement
      } else {
        console.error('Invalid SVG content')
      }
    }
  }, [open, svgContent])

  const convertSvgToPng = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) {
        reject('SVG element not found')
        return
      }

      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject('Error loading SVG')
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
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
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] bg-[#FFF9F0] border border-[#FFC0CB] p-0">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
              <div dangerouslySetInnerHTML={{ __html: svgContent }} className="max-w-full max-h-full" aria-label={alt} />
            </div>
            <div className="flex justify-between p-4 bg-white w-full border-t border-[#ada9a9]">
              <div className="w-full max-w-md mx-auto flex justify-between">
                <Button onClick={handleCopy} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleDownload} className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC] transition-colors">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
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