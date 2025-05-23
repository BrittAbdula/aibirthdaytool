import { auth } from '@/auth'
import { Metadata } from "next"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MyCardsClient } from './my-cards-client'

export const metadata: Metadata = {
  title: "My Cards Collection | MewTruCard",
  description: "Access your personalized greeting card collection, view your previously sent cards, and manage your AI-generated greeting cards all in one convenient dashboard. Create, edit, and share your special memories.",
};

interface ApiLogEntry {
  id: number;
  cardId: string;
  cardType: string;
  responseContent: string;
  timestamp: Date;
}

interface EditedCardEntry {
  id: string;
  cardType: string | null;
  r2Url: string | null;
  editedContent: string | null;
  createdAt: Date;
}

export default async function MyCardsPage() {
  const session = await auth()

  if (!session?.user?.id) {
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

  const [generatedCardsData, sentCardsData] = await Promise.all([
    prisma.apiLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100,
      select: {
        id: true,
        cardId: true,
        cardType: true,
        responseContent: true,
        timestamp: true,
      }
    }),
    prisma.editedCard.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      select: {
        id: true,
        cardType: true,
        r2Url: true,
        editedContent: true,
        createdAt: true,
      }
    })
  ])

  const generatedCards: ApiLogEntry[] = generatedCardsData.map(card => ({ ...card, id: Number(card.id), timestamp: card.timestamp }))
  const sentCards: EditedCardEntry[] = sentCardsData.map(card => ({ ...card, createdAt: card.createdAt }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cards</h1>
        <MyCardsClient 
          initialGeneratedCards={generatedCards}
          initialSentCards={sentCards}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
