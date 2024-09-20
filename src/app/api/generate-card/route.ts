import { NextResponse } from 'next/server';
import { generateCardContent } from '@/lib/gpt';

export async function POST(request: Request) {
  try {
    const { cardType, name } = await request.json();

    if (!cardType || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const svgContent = await generateCardContent(cardType, name);
    return NextResponse.json({ svgContent });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}