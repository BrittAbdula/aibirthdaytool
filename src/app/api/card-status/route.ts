import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudflareImages } from '@/lib/r2';

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
    // console.log('gpt4o-image-------card', card);

    if(card.promptVersion === 'gpt4o-image'){
      const data = await getGenerateStatus(card.taskId || '');
      // console.log('gpt4o-image-------data', data);
      if(data?.status === 'SUCCESS'){
        const imageUrl = data?.response?.resultUrls?.[0];
        if(imageUrl){
          const r2Url = await uploadToCloudflareImages(imageUrl);
          await prisma.apiLog.update({
            where: { cardId },
            data: { status: 'completed', r2Url: r2Url },
          });
        }
      }else if(data?.status === 'GENERATE_FAILED'){
        await prisma.apiLog.update({
          where: { cardId },
          data: { status: 'failed', errorMessage: data?.errorMessage || '' },
        });
      }
      const status = data?.status === 'SUCCESS' ?  'completed' : data?.status === 'GENERATE_FAILED' ? 'failed' : 'processing';
      
      // 添加缓存控制头
      const response = NextResponse.json({
        status: status,
        r2Url: data?.response?.resultUrls?.[0] || '',
      });
      
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    }
    
    // 同样为其他情况添加缓存控制头
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
      },
      // 添加缓存控制
      cache: 'no-store'
    });

    const data = await response.json() as KieAPIResponse<ImageDetailsData>;
    
    return data.data;
}