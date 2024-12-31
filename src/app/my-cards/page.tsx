import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {prisma} from '@/lib/prisma'
import CardGallery from '@/app/card-gallery/CardGallery'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  const [cards, totalPages] = await Promise.all([
    prisma.apiLog.findMany({
      where: {
        userActions: {
          some: {
            action: 'send',
            userId: session.user.id
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 12,
    }),
    prisma.apiLog.count({
      where: {
        userActions: {
          some: {
            action: 'send',
            userId: session.user.id
          }
        }
      }
    }).then(total => Math.ceil(total / 12))
  ])

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Sent Cards</h1>
          <span className="text-sm text-gray-500">
            Total: {cards.length} cards
          </span>
        </div>
        <CardGallery 
          initialCardsData={{
            cards,
            totalPages
          }}
          wishCardType={null}
        />
      </div>
    </div>
  )
}
