import EditCardClient from './EditCardClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ cardId: string; cardType: string }>
}) {
  return <EditCardClient params={await params} />
}
