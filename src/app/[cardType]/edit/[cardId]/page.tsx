import EditCardClient from './EditCardClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function EditCardPage({ params }: { params: { cardId: string, cardType: string } }) {
  return <EditCardClient params={params} />
}