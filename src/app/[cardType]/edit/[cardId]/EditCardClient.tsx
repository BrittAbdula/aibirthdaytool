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

const IsMobileWrapper = dynamic(() => import('@/components/IsMobileWrapper'), { ssr: false })

export default function EditCardClient({ params }: { params: { cardId: string, cardType: CardType } }) {
  const { cardId, cardType } = params
  const [svgContent, setSvgContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  // ... rest of your component remains unchanged
  
  // Keep all the existing functions and return statement as they were
  
  return (
    // Your entire existing UI remains the same
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] via-[#FFF5F7] to-[#FFF0F5] px-4 py-6 sm:py-8">
      {/* All the existing JSX remains unchanged */}
    </div>
  )
} 