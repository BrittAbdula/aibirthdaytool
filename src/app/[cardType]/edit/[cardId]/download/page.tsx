'use client'

import React, { useEffect, useMemo, useState } from 'react'
import NextImage from 'next/image'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { recordUserAction } from '@/lib/action'
import { CardType } from '@/lib/card-config'
import { useSearchParams } from 'next/navigation'

interface DownloadGatePageProps {
  params: { cardId: string; cardType: CardType }
}

export default function DownloadGatePage({ params }: DownloadGatePageProps) {
  const { cardId, cardType } = params
  const { toast } = useToast()
  const [sourceUrl, setSourceUrl] = useState<string>('')
  const [isPreparing, setIsPreparing] = useState(false)
  const [intent, setIntent] = useState<'copy' | 'download' | null>(null)
  const searchParams = useSearchParams()

  const isSvgData = useMemo(() => sourceUrl.startsWith('data:image/svg+xml'), [sourceUrl])
  const isVideo = useMemo(() => {
    if (!sourceUrl) return false
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg']
    return videoExtensions.some(ext => sourceUrl.toLowerCase().includes(ext))
  }, [sourceUrl])

  function convertSvgToPng(svgDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!svgDataUrl.startsWith('data:image/svg+xml')) {
        resolve(svgDataUrl)
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
      img.src = svgDataUrl
    })
  }

  useEffect(() => {
    // Read payload via key from localStorage
    try {
      const key = searchParams.get('k')
      if (key) {
        const raw = localStorage.getItem(`mewtrucard_gate_${key}`)
        if (raw) {
          const parsed = JSON.parse(raw) as { src: string; intent?: 'copy' | 'download' }
          if (parsed?.src) setSourceUrl(parsed.src)
          if (parsed?.intent === 'copy' || parsed?.intent === 'download') setIntent(parsed.intent)
          // one-time read
          localStorage.removeItem(`mewtrucard_gate_${key}`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [searchParams])

  useEffect(() => {
    // No manual push here; allow auto-ads to handle placement
  }, [])

  async function handleDownload() {
    if (!sourceUrl) return
    try {
      setIsPreparing(true)
      const finalUrl = isSvgData ? await convertSvgToPng(sourceUrl) : sourceUrl
      const link = document.createElement('a')
      link.href = finalUrl
      link.download = isVideo ? `${cardType}_card.mp4` : `${cardType}_card.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      await recordUserAction(cardId, 'download')
      toast({ description: isVideo ? 'Video downloaded' : 'Image downloaded' })
    } catch (err) {
      console.error('Download failed: ', err)
      toast({ variant: 'destructive', description: 'Download failed. Try again.' })
    } finally {
      setIsPreparing(false)
    }
  }

  async function handleCopy() {
    if (!sourceUrl) return
    try {
      if (isVideo) {
        await navigator.clipboard.writeText(sourceUrl)
        toast({ description: 'Video URL copied' })
      } else {
        const finalUrl = isSvgData ? await convertSvgToPng(sourceUrl) : sourceUrl
        const blob = await fetch(finalUrl).then(res => res.blob())
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        toast({ description: 'Image copied' })
      }
      await recordUserAction(cardId, 'copy')
    } catch (err) {
      console.error('Copy failed:', err)
      toast({ variant: 'destructive', description: 'Copy failed. Try again.' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1555702340859042"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          <div className="hidden lg:block lg:col-span-2" aria-hidden />

          <div className="lg:col-span-2 flex flex-col items-center justify-start gap-6">
            <div className="w-full max-w-sm">
              <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="relative aspect-[2/3] flex items-center justify-center">
                  {sourceUrl ? (
                    isVideo ? (
                      <video src={sourceUrl} controls className="w-full h-auto object-contain" />
                    ) : (
                      <NextImage src={sourceUrl} alt={`${cardType} preview`} width={480} height={720} className="w-full h-auto object-contain" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No media found. Go back and click Download again.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCopy} className="bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300">
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!sourceUrl || isPreparing}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isPreparing ? 'Preparing...' : 'Download'}
              </Button>
              <Button variant="secondary" onClick={() => history.back()}>Back</Button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2" aria-hidden />
        </div>
      </div>
    </div>
  )
}


