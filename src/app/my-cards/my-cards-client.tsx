'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageViewer } from '@/components/ImageViewer'
import { Checkbox } from "@/components/ui/checkbox"
import { deleteGeneratedCards, deleteSentCards } from './actions'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ApiLogEntry, EditedCardEntry } from './types' // Import shared types

// Types are now imported from ./types.ts
// interface ApiLogEntry { ... }
// interface EditedCardEntry { ... }

interface MyCardsClientProps {
  initialGeneratedCards: ApiLogEntry[];
  initialSentCards: EditedCardEntry[];
  userId: string;
}

function SubmitButton({ pendingText, children }: { pendingText: string, children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      variant="destructive" 
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? pendingText : children}
    </Button>
  )
}

// New wrapper component for individual card with selection capability
interface SelectableImageViewerProps {
  cardId: string; // String ID for consistency with ImageViewer and selection handling
  cardType: string;
  imgUrl?: string;
  svgContent?: string;
  alt: string;
  isNewCard: boolean;
  isSelected: boolean;
  onSelectedChange: (cardId: string, isSelected: boolean) => void;
}

function SelectableImageViewer({ 
  cardId, cardType, imgUrl, svgContent, alt, isNewCard, 
  isSelected, onSelectedChange 
}: SelectableImageViewerProps) {
  return (
    <div className="relative group">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelectedChange(cardId, !!checked)}
        className="absolute top-2 left-2 z-10 bg-white data-[state=checked]:bg-purple-600 data-[state=checked]:text-white group-hover:opacity-100 transition-opacity duration-200"
        aria-label={`Select card ${alt}`}
      />
      <ImageViewer
        cardId={cardId}
        cardType={cardType}
        imgUrl={imgUrl}
        svgContent={svgContent}
        alt={alt}
        isNewCard={isNewCard}
      />
    </div>
  );
}

export function MyCardsClient({ initialGeneratedCards, initialSentCards, userId }: MyCardsClientProps) {
  const router = useRouter()
  const [selectedSentCardIds, setSelectedSentCardIds] = useState<string[]>([])
  const [selectedGeneratedCardIds, setSelectedGeneratedCardIds] = useState<number[]>([])

  const [generatedCards, setGeneratedCards] = useState<ApiLogEntry[]>(initialGeneratedCards)
  const [sentCards, setSentCards] = useState<EditedCardEntry[]>(initialSentCards)

  const [deleteSentState, deleteSentAction] = useFormState(deleteSentCards, null)
  const [deleteGeneratedState, deleteGeneratedAction] = useFormState(deleteGeneratedCards, null)

  useEffect(() => {
    if (deleteSentState?.success) {
      setSentCards(prev => prev.filter(card => !selectedSentCardIds.includes(card.id)))
      setSelectedSentCardIds([])
      router.refresh()
    } else if (deleteSentState?.message) {
      console.error("Error deleting sent cards:", deleteSentState.message)
    }
  }, [deleteSentState, router]) // Removed selectedSentCardIds from deps, not needed here for this effect logic

  useEffect(() => {
    if (deleteGeneratedState?.success) {
      setGeneratedCards(prev => prev.filter(card => !selectedGeneratedCardIds.includes(card.id)))
      setSelectedGeneratedCardIds([])
      router.refresh()
    } else if (deleteGeneratedState?.message) {
      console.error("Error deleting generated cards:", deleteGeneratedState.message)
    }
  }, [deleteGeneratedState, router]) // Removed selectedGeneratedCardIds from deps

  // Sent card ID is string
  const handleSentCardSelect = (cardId: string, isSelected: boolean) => {
    setSelectedSentCardIds(prev =>
      isSelected ? [...prev, cardId] : prev.filter(id => id !== cardId)
    )
  }

  // Generated card ID is number, but selection handler receives string from SelectableImageViewer
  const handleGeneratedCardSelect = (cardStringId: string, isSelected: boolean) => {
    const cardId = parseInt(cardStringId, 10);
    setSelectedGeneratedCardIds(prev =>
      isSelected ? [...prev, cardId] : prev.filter(id => id !== cardId)
    )
  }

  useEffect(() => {
    setGeneratedCards(initialGeneratedCards)
  }, [initialGeneratedCards])

  useEffect(() => {
    setSentCards(initialSentCards)
  }, [initialSentCards])

  return (
    <Tabs defaultValue="sent" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
        <TabsTrigger value="sent" className="text-sm sm:text-base">
          Sent Cards ({sentCards.length})
        </TabsTrigger>
        <TabsTrigger value="generated" className="text-sm sm:text-base">
          Generated Cards ({generatedCards.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sent">
        {selectedSentCardIds.length > 0 && (
          <form action={deleteSentAction} className="mb-4 flex justify-end">
            <input type="hidden" name="cardIds" value={selectedSentCardIds.join(',')} />
            <SubmitButton pendingText="Deleting...">
              Delete Selected ({selectedSentCardIds.length})
            </SubmitButton>
          </form>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sentCards.map((card) => (
            <SelectableImageViewer
              key={card.id}
              alt="Sent Card"
              cardId={card.id} // EditedCard.id is string
              cardType={card.cardType || ''}
              imgUrl={card.r2Url || ''}
              isNewCard={false}
              svgContent={card.editedContent || ''}
              isSelected={selectedSentCardIds.includes(card.id)}
              onSelectedChange={handleSentCardSelect}
            />
          ))}
        </div>
        {sentCards.length === 0 && selectedSentCardIds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sent cards yet. Create and send your first card!</p>
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
              <Link href="/cards/">Create New Card</Link>
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="generated">
        {selectedGeneratedCardIds.length > 0 && (
          <form action={deleteGeneratedAction} className="mb-4 flex justify-end">
            <input type="hidden" name="cardIds" value={selectedGeneratedCardIds.map(id => String(id)).join(',')} />
            <SubmitButton pendingText="Deleting...">
              Delete Selected ({selectedGeneratedCardIds.length})
            </SubmitButton>
          </form>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {generatedCards.map((card) => (
            <SelectableImageViewer
              key={card.id}
              alt="Generated Card"
              cardId={String(card.id)} // ApiLog.id (number) converted to string for SelectableImageViewer
              cardType={card.cardType}
              isNewCard={false}
              imgUrl={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.responseContent)}`}
              isSelected={selectedGeneratedCardIds.includes(card.id)}
              onSelectedChange={handleGeneratedCardSelect}
            />
          ))}
        </div>
        {generatedCards.length === 0 && selectedGeneratedCardIds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No generated cards yet. Start creating!</p>
            <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
              <Link href="/cards/">Create New Card</Link>
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
} 