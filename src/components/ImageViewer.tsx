'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DownloadIcon, CopyIcon, Pencil1Icon, PaperPlaneIcon, TwitterLogoIcon, EnvelopeClosedIcon, EyeOpenIcon, HeartFilledIcon, ArrowUpIcon } from '@radix-ui/react-icons'
import { isMobile } from 'react-device-detect'
import { recordUserAction } from '@/lib/action'
import { useRouter } from 'next/navigation'
import CardDisplay from './CardDisplay'
import { ThumbsUpIcon, Crown } from 'lucide-react'
import { PremiumModal } from '@/components/PremiumModal'

interface ImageViewerProps {
  alt: string
  cardId: string
  cardType: string
  isNewCard: boolean
  imgUrl?: string
  svgContent?: string
  premium?: boolean
  isPremiumUser?: boolean
}

export function ImageViewer({ alt, cardId, cardType, imgUrl, isNewCard, svgContent, premium, isPremiumUser }: ImageViewerProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [animateLike, setAnimateLike] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  useEffect(() => {
    const likedCards = JSON.parse(localStorage.getItem('likedCards') || '{}');
    if (likedCards[cardId]) {
      setIsLiked(true);
    }
  }, [cardId]);

  const handleEdit = () => {
    router.push(`/${cardType}/edit/${cardId}/`)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const likedCards = JSON.parse(localStorage.getItem('likedCards') || '{}');
    const newLikedStatus = !isLiked;

    setIsLiked(newLikedStatus);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 300);

    if (newLikedStatus) {
      recordUserAction(cardId, 'up');
      likedCards[cardId] = true;
    } else {
      delete likedCards[cardId];
    }

    localStorage.setItem('likedCards', JSON.stringify(likedCards));
  };

  const handlePremiumClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPremiumModalOpen(true);
  };

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
            
            {/* Premium Icon - 与 up icon 大小一致 */}
            {premium && (
              <div 
                className="absolute top-4 left-4 p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg z-10"
                onClick={handlePremiumClick}
              >
                <Crown className="h-5 w-5 text-white" />
              </div>
            )}
            
            {/* Like Button */}
            <div
              className={
                `absolute bottom-4 right-4 p-2 rounded-full cursor-pointer transition-all duration-300
                ${isLiked ? 'bg-red-100' : 'bg-gray-200'}
                ${animateLike ? 'scale-125' : 'scale-100'}
                `
              }
              onClick={handleLike}
            >
              <ThumbsUpIcon className={`h-5 w-5 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <div className="flex flex-col items-center justify-center h-full">
            {!showPreview ? (
              <div className="relative w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center p-4">
                <CardImage src={imgUrl} alt={alt} isLarge />
                
                {/* Premium Icon in Dialog - 保持 icon */}
                {premium && (
                  <div 
                  className="absolute top-4 left-4 p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg z-10"
                  onClick={handlePremiumClick}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-[calc(100vh-200px)] overflow-auto flex items-center justify-center">
                <CardDisplay
                  card={{
                    cardId: cardId,
                    cardType: cardType,
                    r2Url: imgUrl,
                    svgContent: svgContent
                  }}
                />
                
                {/* Premium Icon in Preview Mode */}
                {premium && (
                  <div 
                  className="absolute top-4 left-4 p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg z-10"
                  onClick={handlePremiumClick}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                )}
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

      {/* PremiumModal - 直接使用 Modal 组件 */}
      {!isPremiumUser && (
        <PremiumModal isOpen={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen} />
      )}
    </>
  )
}