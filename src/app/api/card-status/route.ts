import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if(card.promptVersion === 'gpt4o-image'){
      const data = await getGenerateStatus(card.taskId || '');
      return NextResponse.json({
        status: data?.status === 'SUCCESS' ? 'completed' : 'failed',
        r2Url: data?.response?.resultUrls?.[0] || '',
      });
    }
    return NextResponse.json({
      status: card.status,
      r2Url: card.r2Url || '',
      responseContent: card.responseContent || '',
      isError: card.isError,
      errorMessage: card.errorMessage,
    });
  } catch (error) {
    console.error('Error checking card status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const TASK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;


export interface KieAPIResponse<T> {
  code: 200 | 401 | 402 | 404 | 422 | 429 | 455 | 500 | 505;
  msg?: string;
  data?: T;
}

export interface ImageDetailsData {
  taskId: string;
  paramJson: string;
  completeTime: number;
  response: {
    resultUrls: string[];
  };
  successFlag: number;
  status: 'GENERATING' | 'SUCCESS' | 'CREATE_TASK_FAILED' | 'GENERATE_FAILED';
  errorCode?: number;
  errorMessage?: string;
  createTime: number;
  progress: string;
}

// get generate status by taskId from 4o
async function getGenerateStatus(taskId: string) {
  
    // Call external API to get status
    const response = await fetch(`https://kieai.erweima.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`
      }
    });

    const data = await response.json() as KieAPIResponse<ImageDetailsData>;
    
    return data.data;

} 