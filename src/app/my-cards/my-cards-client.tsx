'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageViewer } from '@/components/ImageViewer'
import { Checkbox } from "@/components/ui/checkbox"
import { deleteGeneratedCards, deleteSentCards, deleteRecipientGroups } from './actions'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ApiLogEntry, EditedCardEntry, RecipientRelationship } from './types' // Import shared types
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send } from 'lucide-react'

// Types are now imported from ./types.ts
// interface ApiLogEntry { ... }
// interface EditedCardEntry { ... }

interface MyCardsClientProps {
  initialGeneratedCards: ApiLogEntry[];
  initialSentCards: EditedCardEntry[];
  initialRecipientRelationships: RecipientRelationship[];
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

// New wrapper component for individual card with selection capability and recipient info
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

interface SelectableImageViewerWithRecipientProps extends SelectableImageViewerProps {
  recipientName?: string | null;
  customUrl?: string | null;
  message?: string | null;
  showRecipient?: boolean;
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

function SelectableImageViewerWithRecipient({ 
  cardId, cardType, imgUrl, svgContent, alt, isNewCard, 
  isSelected, onSelectedChange, recipientName, customUrl, message, showRecipient = false
}: SelectableImageViewerWithRecipientProps) {
  const cardUrl = customUrl ? `/to/${customUrl}` : `/to/${cardId}`

  return (
    <div className="relative group">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelectedChange(cardId, !!checked)}
        className="absolute top-2 left-2 z-10 bg-white data-[state=checked]:bg-purple-600 data-[state=checked]:text-white group-hover:opacity-100 transition-opacity duration-200"
        aria-label={`Select card ${alt}`}
      />
      <div className="space-y-2">
        <ImageViewer
          cardId={cardId}
          cardType={cardType}
          imgUrl={imgUrl}
          svgContent={svgContent}
          alt={alt}
          isNewCard={isNewCard}
        />
        {showRecipient && recipientName && (
          <div className="px-2 py-1.5 bg-gray-50 rounded-md border space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Sent to:</p>
              <Link 
                href={cardUrl}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:underline"
              >
                <span>View</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
            <p className="text-sm font-medium text-gray-800 truncate">
              {recipientName}
            </p>
            {message && (
              <div className="pt-1">
                <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">
                  &ldquo;{message.length > 80 ? `${message.substring(0, 80)}...` : message}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 常用的卡片类型
const QUICK_CARD_TYPES = [
  { type: 'birthday', label: 'Birthday', emoji: '🎂' },
  { type: 'thankyou', label: 'Thank You', emoji: '🙏' },
  { type: 'congratulations', label: 'Congratulations', emoji: '🎉' },
  { type: 'love', label: 'Love', emoji: '💕' },
  { type: 'anniversary', label: 'Anniversary', emoji: '💖' },
  { type: 'goodluck', label: 'Good Luck', emoji: '🍀' },
  { type: 'sorry', label: 'Sorry', emoji: '😔' },
  { type: 'holiday', label: 'Holiday', emoji: '🎄' },
  { type: 'eidmubarak', label: 'Eid', emoji: '🌙' },
] as const

// 快速发送按钮组件
interface QuickSendButtonProps {
  recipient: RecipientRelationship;
}

function QuickSendButton({ recipient }: QuickSendButtonProps) {
  const router = useRouter()

  const handleCardTypeSelect = (cardType: string) => {
    // 构建URL参数，预填充收件人信息
    const params = new URLSearchParams({
      recipientName: recipient.recipientName,
      to: recipient.relationship,
    })
    
    if (recipient.senderName) {
      params.set('signed', recipient.senderName)
    }

    // 跳转到对应的卡片制作页面
    router.push(`/${cardType}/?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200"
        >
          <Send className="h-3 w-3 mr-1.5" />
          Quick Send
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {QUICK_CARD_TYPES.map((cardType) => (
          <DropdownMenuItem
            key={cardType.type}
            onClick={() => handleCardTypeSelect(cardType.type)}
            className="flex items-center gap-2 cursor-pointer hover:bg-purple-50"
          >
            <span className="text-lg">{cardType.emoji}</span>
            <span>{cardType.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => router.push('/cards/')}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 border-t border-gray-100"
        >
          <span className="text-lg">✨</span>
          <span>More Card Types</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MyCardsClient({ initialGeneratedCards, initialSentCards, initialRecipientRelationships, userId }: MyCardsClientProps) {
  const router = useRouter()
  const [selectedSentCardIds, setSelectedSentCardIds] = useState<string[]>([])
  const [selectedGeneratedCardIds, setSelectedGeneratedCardIds] = useState<number[]>([])
  const [selectedRecipientGroups, setSelectedRecipientGroups] = useState<string[]>([])

  const [generatedCards, setGeneratedCards] = useState<ApiLogEntry[]>(initialGeneratedCards)
  const [sentCards, setSentCards] = useState<EditedCardEntry[]>(initialSentCards)
  const [recipientRelationships, setRecipientRelationships] = useState<RecipientRelationship[]>(initialRecipientRelationships)

  const [deleteSentState, deleteSentAction] = useFormState(deleteSentCards, null)
  const [deleteGeneratedState, deleteGeneratedAction] = useFormState(deleteGeneratedCards, null)
  const [deleteRecipientsState, deleteRecipientsAction] = useFormState(deleteRecipientGroups, null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleteSentState?.success) {
      setSentCards(prev => prev.filter(card => !selectedSentCardIds.includes(card.id)))
      setSelectedSentCardIds([])
      router.refresh()
    } else if (deleteSentState?.message) {
      console.error("Error deleting sent cards:", deleteSentState.message)
    }
  }, [deleteSentState, router])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleteGeneratedState?.success) {
      setGeneratedCards(prev => prev.filter(card => !selectedGeneratedCardIds.includes(card.id)))
      setSelectedGeneratedCardIds([])
      router.refresh()
    } else if (deleteGeneratedState?.message) {
      console.error("Error deleting generated cards:", deleteGeneratedState.message)
    }
  }, [deleteGeneratedState, router])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleteRecipientsState?.success) {
      // Optimistically remove matching sent cards and recipient groups
      setSentCards(prev => prev.filter(card => {
        const key = `${card.relationship ?? ''}::${card.recipientName ?? ''}`
        return !selectedRecipientGroups.includes(key)
      }))
      setRecipientRelationships(prev => prev.filter(r => {
        const key = `${r.relationship}::${r.recipientName}`
        return !selectedRecipientGroups.includes(key)
      }))
      setSelectedRecipientGroups([])
      router.refresh()
    } else if (deleteRecipientsState?.message) {
      console.error("Error deleting recipient groups:", deleteRecipientsState.message)
    }
  }, [deleteRecipientsState, router])

  // Sent card ID is string
  const handleSentCardSelect = (cardId: string, isSelected: boolean) => {
    setSelectedSentCardIds(prev =>
      isSelected ? [...prev, cardId] : prev.filter(id => id !== cardId)
    )
  }

  // Generated card ID is number, but selection handler receives string from SelectableImageViewer
  const handleGeneratedCardSelect = (cardStringId: string, isSelected: boolean) => {
    const cardId = parseInt(cardStringId, 10);
    if (Number.isNaN(cardId)) return;
    setSelectedGeneratedCardIds(prev =>
      isSelected ? [...prev, cardId] : prev.filter(id => id !== cardId)
    )
  }

  // Recipient selection uses key "relationship::recipientName"
  const handleRecipientSelect = (key: string, isSelected: boolean) => {
    setSelectedRecipientGroups(prev => isSelected ? [...prev, key] : prev.filter(k => k !== key))
  }


  useEffect(() => {
    setGeneratedCards(initialGeneratedCards)
  }, [initialGeneratedCards])

  useEffect(() => {
    setSentCards(initialSentCards)
  }, [initialSentCards])

  useEffect(() => {
    setRecipientRelationships(initialRecipientRelationships)
  }, [initialRecipientRelationships])

  return (
    <Tabs defaultValue="recipients" className="w-full">
      <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-4">
        <TabsTrigger value="recipients" className="text-sm sm:text-base">
          Recipients ({recipientRelationships.length})
        </TabsTrigger>
        <TabsTrigger value="sent" className="text-sm sm:text-base">
          Sent ({sentCards.length})
        </TabsTrigger>
        <TabsTrigger value="generated" className="text-sm sm:text-base">
          Generated ({generatedCards.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="recipients">
        <div className="space-y-4">
          {recipientRelationships.length > 0 && selectedRecipientGroups.length > 0 && (
            <form action={deleteRecipientsAction} className="flex justify-end">
              <input type="hidden" name="groups" value={selectedRecipientGroups.join(',')} />
              <SubmitButton pendingText="Deleting...">Delete Selected ({selectedRecipientGroups.length})</SubmitButton>
            </form>
          )}
          {recipientRelationships.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Recipient Relationships</h3>
                <p className="text-sm text-gray-500 mt-1">People you&apos;ve sent cards to</p>
              </div>
              <div className="divide-y divide-gray-100">
                {recipientRelationships.map((recipient, index) => {
                  const key = `${recipient.relationship}::${recipient.recipientName}`
                  const isSelected = selectedRecipientGroups.includes(key)
                  return (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRecipientSelect(key, !!checked)}
                          className="mt-1 bg-white data-[state=checked]:bg-purple-600 data-[state=checked]:text-white"
                          aria-label={`Select ${recipient.relationship} - ${recipient.recipientName}`}
                        />
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {recipient.relationship}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {recipient.cardCount} card{recipient.cardCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="font-medium text-gray-800">
                            {recipient.recipientName}
                          </p>
                          {recipient.senderName && (
                            <p className="text-sm text-gray-500">
                              Signed by: {recipient.senderName}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          Last sent: {recipient.lastSentDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <QuickSendButton recipient={recipient} />
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recipients yet. Send your first card to see relationship statistics!</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Link href="/cards/">Create New Card</Link>
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

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
            <SelectableImageViewerWithRecipient
              key={card.id}
              alt="Sent Card"
              cardId={card.id} // EditedCard.id is string
              cardType={card.cardType || ''}
              imgUrl={card.r2Url || ''}
              isNewCard={false}
              svgContent={card.editedContent || ''}
              isSelected={selectedSentCardIds.includes(card.id)}
              onSelectedChange={handleSentCardSelect}
              recipientName={card.recipientName}
              customUrl={card.customUrl}
              message={card.message}
              showRecipient={true}
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
              cardId={String(card.id)} // Use numeric id for stable selection
              cardType={card.cardType}
              isNewCard={false}
              imgUrl={card.r2Url || (card.responseContent ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.responseContent)}` : undefined)}
              svgContent={card.responseContent || ''}
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
