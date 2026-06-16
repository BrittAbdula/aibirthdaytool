import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadVideoToR2, uploadToCloudflareImages } from '@/lib/r2';
import { SEEDANCE_VIDEO_MODEL, requestSeedanceVideoStatus } from '@/lib/seedance-video';
import { GPT_IMAGE_2_EDIT_MODEL, GPT_IMAGE_2_MODEL, LEGACY_GPT_IMAGE_2_MODEL, requestGptImage2Status } from '@/lib/gpt-image-2';
import { getRetryAfterSeconds, isTerminalCardStatus } from '@/lib/card-status';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function applyNoStoreHeaders(response: NextResponse, retryAfterSeconds?: number) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  if (retryAfterSeconds) {
    response.headers.set('Retry-After', String(retryAfterSeconds));
  }
  return response;
}

function processingResponse(body: Record<string, unknown> = {}) {
  return applyNoStoreHeaders(
    NextResponse.json({ status: 'processing', r2Url: '', responseContent: '', ...body }),
    getRetryAfterSeconds(30000)
  );
}

async function getResponseContent(cardId: string) {
  const content = await prisma.apiLog.findUnique({
    where: { cardId },
    select: { responseContent: true },
  });

  return content?.responseContent || '';
}

async function updateCardIfNotTerminal(cardId: string, data: Prisma.ApiLogUpdateManyMutationInput) {
  await prisma.apiLog.updateMany({
    where: {
      cardId,
      status: {
        notIn: ['completed', 'failed'],
      },
    },
    data,
  });
}

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
        isError: true,
        errorMessage: true,
        promptVersion: true,
        taskId: true,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (isTerminalCardStatus(card.status)) {
      const responseContent = card.r2Url ? '' : await getResponseContent(cardId);
      return applyNoStoreHeaders(NextResponse.json({
        status: card.status,
        r2Url: card.r2Url || '',
        responseContent,
        isError: card.isError,
        errorMessage: card.errorMessage,
      }));
    }
    // console.log('gpt4o-image-------card', card);

    if (card.promptVersion === LEGACY_GPT_IMAGE_2_MODEL) {
      const errorMessage = 'Legacy gpt-image-2 path is disabled; please regenerate with the current image or SVG model.';
      await updateCardIfNotTerminal(cardId, {
        status: 'failed',
        isError: true,
        errorMessage,
      });

      return applyNoStoreHeaders(NextResponse.json({
        status: 'failed',
        r2Url: '',
        responseContent: '',
        isError: true,
        errorMessage,
      }));
    }

    if (card.promptVersion === GPT_IMAGE_2_MODEL || card.promptVersion === GPT_IMAGE_2_EDIT_MODEL) {
      if (!card.taskId) {
        const response = NextResponse.json({
          status: card.status,
          r2Url: card.r2Url || '',
          responseContent: card.r2Url ? '' : await getResponseContent(cardId),
          isError: card.isError,
          errorMessage: card.errorMessage || 'Missing gpt-image-2 taskId',
        });

        return applyNoStoreHeaders(response);
      }

      try {
        const imageData = await requestGptImage2Status(card.taskId);

        if (imageData.status === 'completed') {
          if (!imageData.imageUrl) {
            const errorMessage = 'GPT Image 2 completed without image URL';
            await updateCardIfNotTerminal(cardId, {
              status: 'failed',
              isError: true,
              errorMessage,
              tokensUsed: imageData.tokensUsed,
            });

            const response = NextResponse.json({
              status: 'failed',
              r2Url: '',
              responseContent: '',
              errorMessage,
            });

            return applyNoStoreHeaders(response);
          }

          let outUrl = imageData.imageUrl;
          try {
            const uploadedUrl = await uploadToCloudflareImages(imageData.imageUrl);
            outUrl = uploadedUrl || imageData.imageUrl;
          } catch {
            outUrl = imageData.imageUrl;
          }

          await updateCardIfNotTerminal(cardId, {
            status: 'completed',
            isError: false,
            r2Url: outUrl,
            tokensUsed: imageData.tokensUsed,
          });

          const response = NextResponse.json({
            status: 'completed',
            r2Url: outUrl,
            responseContent: '',
            progress: 100,
          });

          return applyNoStoreHeaders(response);
        }

        if (imageData.status === 'failed') {
          await updateCardIfNotTerminal(cardId, {
            status: 'failed',
            isError: true,
            errorMessage: imageData.errorMessage || 'GPT Image 2 generation failed',
            tokensUsed: imageData.tokensUsed,
          });

          const response = NextResponse.json({
            status: 'failed',
            r2Url: '',
            responseContent: '',
            errorMessage: imageData.errorMessage || 'GPT Image 2 generation failed',
          });

          return applyNoStoreHeaders(response);
        }

        return processingResponse({
          progress: imageData.progress,
          message: `Image is being generated (${imageData.progress}%)`,
        });
      } catch (error) {
        return processingResponse({
          message: error instanceof Error ? error.message : 'GPT Image 2 is being generated',
        });
      }
    }

    if(card.promptVersion === 'gpt4o-image'){
      const data = await getGenerateStatus(card.taskId || '');
      let outUrl = data?.response?.resultUrls?.[0] || '';
      if(data?.status === 'SUCCESS'){
        const imageUrl = outUrl;
        if(imageUrl){
          try {
            const r2Url = await uploadToCloudflareImages(imageUrl);
            outUrl = r2Url || imageUrl;
          } catch (e) {
            // Fallback to original URL on upload failure
            outUrl = imageUrl;
          }
          await updateCardIfNotTerminal(cardId, {
            status: 'completed',
            r2Url: outUrl,
          });
        }
      }else if(data?.status === 'GENERATE_FAILED'){
        await updateCardIfNotTerminal(cardId, {
          status: 'failed',
          errorMessage: data?.errorMessage || '',
        });
      }
      const status = data?.status === 'SUCCESS' ?  'completed' : data?.status === 'GENERATE_FAILED' ? 'failed' : 'processing';
      
      // 添加缓存控制头
      const response = NextResponse.json({
        status: status,
        r2Url: outUrl,
      });
      
      return status === 'processing'
        ? applyNoStoreHeaders(response, getRetryAfterSeconds(30000))
        : applyNoStoreHeaders(response);
    }

    // Handle Banana image generation status (Edit/Pro)
    if(
      card.promptVersion === 'google/nano-banana-edit' ||
      card.promptVersion === 'nano-banana-edit' ||
      card.promptVersion === 'google/nano-banana-pro' ||
      card.promptVersion === 'google/nano-banana'
    ){
      const taskId = card.taskId || '';
      let data: any = null;
      try {
        const resp = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.KIE_API_KEY}`
          },
          cache: 'no-store'
        });
        data = await resp.json();
      } catch (e) {
        // Network or API failure — keep polling without failing the route
        return processingResponse();
      }
      // Normalize
      const state = data?.data?.state as ('waiting'|'success'|'fail'|undefined);
      let status: 'processing'|'completed'|'failed' = 'processing';
      if (state === 'success') status = 'completed';
      if (state === 'fail') status = 'failed';

      let resultUrl = '';
      try {
        const resultJson = data?.data?.resultJson;
        const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
        resultUrl = parsed?.resultUrls?.[0] || '';
      } catch {}

      if (status === 'completed' && resultUrl) {
        let outUrl = resultUrl;
        try {
          const r2Url = await uploadToCloudflareImages(resultUrl);
          outUrl = r2Url || resultUrl;
        } catch (e) {
          outUrl = resultUrl; // fallback
        }
        await updateCardIfNotTerminal(cardId, {
          status: 'completed',
          r2Url: outUrl,
        });
        const response = NextResponse.json({ status: 'completed', r2Url: outUrl });
        return applyNoStoreHeaders(response);
      }

      if (status === 'failed') {
        await updateCardIfNotTerminal(cardId, {
          status: 'failed',
          errorMessage: data?.data?.failMsg || 'Banana generation failed',
        });
        const response = NextResponse.json({ status: 'failed', r2Url: '', errorMessage: data?.data?.failMsg || 'Banana generation failed' });
        return applyNoStoreHeaders(response);
      }

      // processing
      return processingResponse();
    }

    // Handle Seedance video generation status
    if (card.promptVersion === SEEDANCE_VIDEO_MODEL || card.promptVersion?.includes('seedance')) {
      try {
        const videoData = await requestSeedanceVideoStatus(card.taskId || '');

        if (videoData.status === 'completed') {
          if (videoData.videoUrl) {
            const r2Url = await uploadVideoToR2(videoData.videoUrl, card.taskId || '');
            await updateCardIfNotTerminal(cardId, {
              status: 'completed',
              r2Url,
              tokensUsed: videoData.tokensUsed,
            });

            const response = NextResponse.json({
              status: 'completed',
              r2Url,
              responseContent: '',
              progress: 100,
            });

            return applyNoStoreHeaders(response);
          }
        }

        if (videoData.status === 'failed') {
          await updateCardIfNotTerminal(cardId, {
            status: 'failed',
            errorMessage: videoData.errorMessage || 'Seedance video generation failed',
          });

          const response = NextResponse.json({
            status: 'failed',
            r2Url: '',
            responseContent: '',
            errorMessage: videoData.errorMessage || 'Seedance video generation failed',
          });

          return applyNoStoreHeaders(response);
        }

        return processingResponse({
          progress: videoData.progress,
          message: `Video is being generated (${videoData.progress}%)`,
        });
      } catch (error) {
        return processingResponse({
          message: error instanceof Error ? error.message : 'Seedance video is being generated',
        });
      }
    }

    // Handle HM video generation status
    if(card.promptVersion && card.promptVersion.includes('veo')){
      const videoData = await getHMVideoStatus(card.taskId || '');
      
      if(videoData?.code === 'success'){
        const videoUrl = videoData?.data?.video_url;
        if(videoUrl){
          // For videos, we might want to store the URL directly or upload to R2
          const r2Url = await uploadVideoToR2(videoUrl, card.taskId || '');
          await updateCardIfNotTerminal(cardId, {
            status: 'completed',
            r2Url: r2Url,
          });
          
          // Return the completed video with R2 URL
          const response = NextResponse.json({
            status: 'completed',
            r2Url: r2Url,
            responseContent: '', // Videos don't have SVG content
          });
          
          return applyNoStoreHeaders(response);
        }
      } else if(videoData?.code === 'failed'){
        await updateCardIfNotTerminal(cardId, {
          status: 'failed',
          errorMessage: videoData?.message || 'Video generation failed',
        });
        
        // Return the failed status
        const response = NextResponse.json({
          status: 'failed',
          r2Url: '',
          responseContent: '',
          errorMessage: videoData?.message || 'Video generation failed'
        });
        
        return applyNoStoreHeaders(response);
      }
      
      // For processing status, return the current progress
      return processingResponse({
        progress: videoData?.data?.progress || 0,
        message: videoData?.message || 'Video is being generated'
      });
    }

    // Handle Luma video generation status
    if(card.promptVersion && card.promptVersion.includes('luma') && card.promptVersion.includes('video')){
      const videoData = await getLumaVideoStatus(card.taskId || '');
      
      if(videoData?.state === 'completed'){
        const videoUrl = videoData?.video?.download_url || videoData?.video?.url;
        if(videoUrl){
          // For videos, we might want to store the URL directly or upload to R2
          const r2Url = await uploadVideoToR2(videoUrl, card.taskId || '');
          await updateCardIfNotTerminal(cardId, {
            status: 'completed',
            r2Url: r2Url,
          });
          
          // Return the completed video with R2 URL
          const response = NextResponse.json({
            status: 'completed',
            r2Url: r2Url,
            responseContent: '', // Videos don't have SVG content
          });
          
          return applyNoStoreHeaders(response);
        }
      } else if(videoData?.state === 'failed'){
        await updateCardIfNotTerminal(cardId, {
          status: 'failed',
          errorMessage: 'Luma video generation failed',
        });
        
        // Return the failed status
        const response = NextResponse.json({
          status: 'failed',
          r2Url: '',
          responseContent: '',
          errorMessage: 'Luma video generation failed'
        });
        
        return applyNoStoreHeaders(response);
      }
      
      // For processing status, return the current progress
      return processingResponse({
        message: `Video is being generated (${videoData?.state || 'processing'})`
      });
    }
    
    // 同样为其他情况添加缓存控制头
    const response = NextResponse.json({
      status: card.status,
      r2Url: card.r2Url || '',
      responseContent: card.r2Url ? '' : await getResponseContent(cardId),
      isError: card.isError,
      errorMessage: card.errorMessage,
    });
    
    return applyNoStoreHeaders(response);
  } catch (error) {
    console.error('Error checking card status:', error);
    
    return applyNoStoreHeaders(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
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
  try {
    const response = await fetch(`https://kieai.erweima.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`
      },
      cache: 'no-store'
    });
    const data = await response.json() as KieAPIResponse<ImageDetailsData>;
    return data.data;
  } catch (e) {
    // Network failure — return null to keep polling
    return null as any;
  }
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
    const response = await fetch(`${baseUrl}/google/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    console.log('-------request', `${baseUrl}/google/v1/tasks/${taskId}`);

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

// Luma Video status response interface
export interface LumaVideoStatusResponse {
  id: string;
  state: 'pending' | 'processing' | 'completed' | 'failed';
  video?: {
    url: string;
    width: number;
    height: number;
    thumbnail: string;
    download_url: string;
  };
  video_raw?: {
    url: string;
    width: number;
    height: number;
  };
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  prompt?: string;
  created_at: string;
  estimate_wait_seconds?: number;
  liked?: boolean;
  user_id?: string;
  batch_id?: string;
  pipeline_id?: string;
  queue_state?: string;
  last_frame?: {
    url: string;
    width: number;
    height: number;
  };
}

// get video generation status by taskId from Luma API
async function getLumaVideoStatus(taskId: string): Promise<LumaVideoStatusResponse | null> {
  try {
    const baseUrl = process.env.HM_BASE_URL;
    const apiKey = process.env.HM_API_KEY;
    
    if (!baseUrl || !apiKey) {
      console.error('Luma API credentials not configured');
      return null;
    }

    // Call Luma API to get video status
    const response = await fetch(`${baseUrl}/luma/generations/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    console.log('-------Luma request', `${baseUrl}/luma/generations/${taskId}`);

    if (!response.ok) {
      console.error(`Luma video status API error: ${response.status}`);
      return null;
    }

    const data: LumaVideoStatusResponse = await response.json();
    
    return data;
    
  } catch (error) {
    console.error('Error checking Luma video status:', error);
    return null;
  }
}
