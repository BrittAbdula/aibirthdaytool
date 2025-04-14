import { auth } from '@/auth'
import { Metadata } from "next"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageViewer } from '@/components/ImageViewer'

export const metadata: Metadata = {
  title: "My Cards Collection | MewTruCard",
  description: "Access your personalized greeting card collection, view your previously sent cards, and manage your AI-generated greeting cards all in one convenient dashboard. Create, edit, and share your special memories.",
};

export default async function MyCardsPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-purple-50 to-white">
        <div className="text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Sign in to Store and View Your Cards
            </span>
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Access your personalized card collection and continue creating beautiful memories
          </p>
          <Button asChild className="bg-[#FFC0CB] text-[#4A4A4A] hover:bg-[#FFD1DC]">
            <Link href="/api/auth/signin">Sign In with Google</Link>
          </Button>
        </div>
      </div>
    )
  }

  const [generatedCards, sentCards] = await Promise.all([
    prisma.apiLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 12,
    }),
    prisma.editedCard.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12,
    })
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cards</h1>
        
        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="sent" className="text-sm sm:text-base">
              Sent Cards ({sentCards.length})
            </TabsTrigger>
            <TabsTrigger value="generated" className="text-sm sm:text-base">
              Generated Cards ({generatedCards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sentCards.map((card) => (
                <ImageViewer
                  key={card.id}
                  alt="Card"
                  cardId={card.id}
                  cardType={card.cardType || ''}
                  imgUrl={card.r2Url || ''}
                  isNewCard={false}
                  svgContent={card.editedContent || ''}
                />
              ))}
            </div>
            {sentCards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No sent cards yet. Create and send your first card!</p>
                <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <Link href="/cards/">Create New Card</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="generated">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {generatedCards.map((card) => (
                <ImageViewer 
                  key={card.id}
                  alt="Card" 
                  cardId={card.cardId} 
                  cardType={card.cardType} 
                  isNewCard={false}
                  imgUrl={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.responseContent)}`}
                />
              ))}
            </div>
            {generatedCards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No generated cards yet. Start creating!</p>
                <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <Link href="/cards/">Create New Card</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
