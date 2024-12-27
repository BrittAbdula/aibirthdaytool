import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
export const maxDuration = 30; // This function can run for a maximum of 30 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {

  try {
    const {
      cardType,
      recipientName,
      relationship,
      senderName,
      message,
      ...otherFields
    } = await request.json();

    if (!cardType) {
      return NextResponse.json({ error: 'Missing required field: cardType' }, { status: 400 });
    }

    // Combine all fields into a single object
    const cardData = {
      cardType,
      recipientName,
      relationship,
      senderName,
      message,
      ...otherFields
    };

    const { svgContent, cardId } = await generateCardContent(cardData);
    return NextResponse.json({ svgContent, cardId });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}