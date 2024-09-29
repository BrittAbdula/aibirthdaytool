import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';
export const maxDuration = 20; // This function can run for a maximum of 20 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { cardType, name, age, relationship, tone, bestWishes, senderName, additionalInfo } = await request.json();

    if (!cardType ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const svgContent = await generateCardContent({ 
      cardType, 
      name, 
      age, 
      relationship, 
      tone, 
      bestWishes, 
      senderName, 
      additionalInfo 
    });
    return NextResponse.json({ svgContent });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}