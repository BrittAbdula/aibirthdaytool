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
  svgContent?: string
}

export function ImageViewer({ alt, cardId, cardType, imgUrl, isNewCard, svgContent }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)

  const handleEdit = () => {
    router.push(`/${cardType}/edit/${cardId}/`)
  }


  function CardImage({ src, alt, isLarge = false }: { src?: string, alt: string, isLarge?: boolean }) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`object-contain ${isLarge ? 'max-w-full max-h-full' : 'w-full h-auto hover:scale-105 transition-transform duration-300'}`}
        width={isLarge ? undefined : 400}
        height={isLarge ? undefined : 600}
      />
    )
  }


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative w-full flex items-center justify-center cursor-pointer group overflow-hidden">
            <CardImage src={imgUrl} alt={alt} />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <div className="flex flex-col items-center justify-center h-full">
            {!showPreview ? (
              <div className="relative w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
                <CardImage src={imgUrl} alt={alt} isLarge />
              </div>
            ) : (
              <div className="w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center">
                <CardDisplay
                  card={{
                    cardId: cardId,
                    cardType: cardType,
                    r2Url: imgUrl,
                    svgContent: svgContent
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
                    customize this card
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
    </>
  )
}