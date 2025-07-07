import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadVideoToR2, uploadToCloudflareImages } from '@/lib/r2';

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

    // Handle HM video generation status
    if(card.promptVersion.includes('video')){
      const videoData = await getHMVideoStatus(card.taskId || '');
      
      if(videoData?.code === 'success'){
        const videoUrl = videoData?.data?.video_url;
        if(videoUrl){
          // For videos, we might want to store the URL directly or upload to R2
          const r2Url = await uploadVideoToR2(videoUrl, card.taskId || '');
          await prisma.apiLog.update({
            where: { cardId },
            data: { status: 'completed', r2Url: r2Url },
          });
          
          // Return the completed video with R2 URL
          const response = NextResponse.json({
            status: 'completed',
            r2Url: r2Url,
            responseContent: '', // Videos don't have SVG content
          });
          
          response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
          
          return response;
        }
      } else if(videoData?.code === 'failed'){
        await prisma.apiLog.update({
          where: { cardId },
          data: { status: 'failed', errorMessage: videoData?.message || 'Video generation failed' },
        });
        
        // Return the failed status
        const response = NextResponse.json({
          status: 'failed',
          r2Url: '',
          responseContent: '',
          errorMessage: videoData?.message || 'Video generation failed'
        });
        
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      }
      
      // For processing status, return the current progress
      const response = NextResponse.json({
        status: 'processing',
        r2Url: '',
        responseContent: '',
        progress: videoData?.data?.progress || 0,
        message: videoData?.message || 'Video is being generated'
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

// HM Video status response interface
export interface HMVideoStatusResponse {
  code: 'success' | 'failed' | 'processing';
  message?: string;
  data?: {
    video_url?: string;
    status?: string;
    progress?: number;
  };
}

// HM API raw response interface (matches the actual API response)
interface HMAPIResponse {
  code: 'success' | 'failed' | 'processing';
  message: string;
  data: {
    task_id: string;
    notify_hook: string;
    action: string;
    status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
    fail_reason: string;
    submit_time: number;
    start_time: number;
    finish_time: number;
    progress: string;
    data: {
      id: string;
      status: 'completed' | 'failed' | 'processing';
      video_url: string;
      status_update_time: number;
    };
  };
}

// get video generation status by taskId from HM API
async function getHMVideoStatus(taskId: string): Promise<HMVideoStatusResponse | null> {
  try {
    const baseUrl = process.env.HM_BASE_URL;
    const apiKey = process.env.HM_API_KEY;
    
    if (!baseUrl || !apiKey) {
      console.error('HM API credentials not configured');
      return null;
    }

    // Call HM API to get video status
    const response = await fetch(`${baseUrl}/google/v1/models/veo/videos/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    console.log('request', `${baseUrl}/google/v1/models/veo/videos/${taskId}`);

    if (!response.ok) {
      console.error(`HM video status API error: ${response.status}`);
      return {
        code: 'failed',
        message: `API request failed with status ${response.status}`
      };
    }

    const data: HMAPIResponse = await response.json();
    
    // Map HM API response to our standard format
    if (data.code === 'success' && data.data) {
      // Check outer status first
      if (data.data.status === 'SUCCESS' && data.data.data) {
        return {
          code: 'success',
          data: {
            video_url: data.data.data.video_url, // Correct path: data.data.data.video_url
            status: data.data.data.status,
            progress: parseInt(data.data.progress.replace('%', '')) || 100
          }
        };
      } else if (data.data.status === 'FAILED') {
        return {
          code: 'failed',
          message: data.data.fail_reason || 'Video generation failed'
        };
      } else {
        // Still processing
        return {
          code: 'processing',
          message: `Video is being generated (${data.data.progress})`,
          data: {
            progress: parseInt(data.data.progress.replace('%', '')) || 0
          }
        };
      }
    } else if (data.code === 'failed' || data.message?.includes('failed')) {
      return {
        code: 'failed',
        message: data.message || 'Video generation failed'
      };
    } else {
      return {
        code: 'processing',
        message: data.message || 'Video is being generated'
      };
    }
    
  } catch (error) {
    console.error('Error checking HM video status:', error);
    return {
      code: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}