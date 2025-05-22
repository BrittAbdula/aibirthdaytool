import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get cardId from URL params
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Missing cardId parameter' }, { status: 400 });
    }

    // Get card status from database
    const card = await prisma.apiLog.findUnique({
      where: { cardId },
      select: {
        status: true,
        r2Url: true,
        responseContent: true,
        isError: true,
        errorMessage: true,
        promptVersion: true,
        taskId: true,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    const response = NextResponse.json({
      status: card.status,
      r2Url: card.r2Url || '',
      responseContent: card.responseContent || '',
      isError: card.isError,
      errorMessage: card.errorMessage,
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error checking card status:', error);
    
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    return response;
  }
}
