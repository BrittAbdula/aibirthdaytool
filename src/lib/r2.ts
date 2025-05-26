import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error('Missing required R2 configuration environment variables');
}

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export async function uploadSvgToR2(svgContent: string, cardId: string, createdAt: Date): Promise<string> {
    try {
        // 使用 UTC 时间来保持一致性
        const year = createdAt.getUTCFullYear()
        const month = String(createdAt.getUTCMonth() + 1).padStart(2, '0')
        const day = String(createdAt.getUTCDate()).padStart(2, '0')
        
        // 构建存储路径：cards/年/月/日/cardId.svg
        const key = `cards/${year}/${month}/${day}/${cardId}.svg`
        
        await r2Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: svgContent,
                ContentType: 'image/svg+xml',
            })
        );

        return `https://store.celeprime.com/${key}`;
    } catch (error) {
        console.error('R2 upload error details:', {
            error,
            accountId: R2_ACCOUNT_ID,
            bucketName: R2_BUCKET_NAME
        });
        throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function uploadImageToR2(imageBuffer: Buffer, taskId: string): Promise<string> {
  try {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      
      const key = `images/${year}/${month}/${day}/${taskId}.png`;
      
      await r2Client.send(
          new PutObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: key,
              Body: imageBuffer,
              ContentType: 'image/png',
          })
      );

      return `https://store.celeprime.com/${key}`;
  } catch (error) {
      console.error('R2 image upload error:', error);
      // 如果上传失败，返回data URL作为备选
      const base64 = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
  }
}

/**
 * Uploads an image directly to Cloudflare Images via URL
 * @param imageUrl The URL of the image to upload
 * @param metadata Optional metadata to attach to the image
 * @param requireSignedURLs Whether the image requires signed URLs for access
 * @returns The Cloudflare Images response with image ID and variant URLs
 */
export async function uploadToCloudflareImages(
    imageUrl: string,
    metadata?: Record<string, any>,
    requireSignedURLs = false
  ): Promise<string> {
    const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    const CF_API_TOKEN = process.env.CF_API_TOKEN;
    const CF_HASH_CODE = process.env.CF_HASH_CODE;
  
    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      throw new Error('Missing required Cloudflare Images configuration environment variables');
    }
  
    try {
      const formData = new FormData();
      formData.append('url', imageUrl);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      formData.append('requireSignedURLs', String(requireSignedURLs));
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
        throw new Error(`Cloudflare Images API error: ${JSON.stringify(errorData.errors)}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(data.errors)}`);
      }

      const cf_url = `https://store.celeprime.com/cdn-cgi/imagedelivery/${CF_HASH_CODE}/${data.result.id}/public`;
      
      return cf_url;
    } catch (error) {
      console.error('Cloudflare Images upload error:', error);
      throw new Error(`Failed to upload to Cloudflare Images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

/**
 * Uploads a base64 image to Cloudflare Images
 * @param base64Data The base64 string of the image (without data:image prefix)
 * @param metadata Optional metadata to attach to the image
 * @param requireSignedURLs Whether the image requires signed URLs for access
 * @returns The Cloudflare Images response with image ID and variant URLs
 */
export async function uploadBase64ToCloudflareImages(
    base64Data: string,
    metadata?: Record<string, any>,
    requireSignedURLs = false
  ): Promise<string> {
    const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    const CF_API_TOKEN = process.env.CF_API_TOKEN;
    const CF_HASH_CODE = process.env.CF_HASH_CODE;
  
    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      throw new Error('Missing required Cloudflare Images configuration environment variables');
    }
  
    try {
      // Convert base64 to blob
      const byteCharacters = Buffer.from(base64Data, 'base64');
      const blob = new Blob([byteCharacters], { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      formData.append('requireSignedURLs', String(requireSignedURLs));
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
        throw new Error(`Cloudflare Images API error: ${JSON.stringify(errorData.errors)}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(data.errors)}`);
      }

      const cf_url = `https://store.celeprime.com/cdn-cgi/imagedelivery/${CF_HASH_CODE}/${data.result.id}/public`;
      
      return cf_url;
    } catch (error) {
      console.error('Cloudflare Images upload error:', error);
      throw new Error(`Failed to upload to Cloudflare Images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * 通过Base64字符串上传图片
   * @param base64Data 图片的Base64字符串 (不包含data:image/...;base64, 前缀)
   * @param mimeType 图片的MIME类型 (e.g., 'image/png')
   * @param metadata 元数据
   * @param customId 自定义图片ID
   * @returns 上传结果
   */
  export async function uploadCloudinaryFromBase64(base64Data: string, mimeType: string, metadata?: Record<string, string>, customId?: string): Promise<{ id: string; uploadedAt: string; url: string }> {
    try {
      console.log('CloudinaryImages: Starting image upload from Base64');
      
      const formData = new FormData();
      // Cloudinary expects the data URI format for base64 uploads
      formData.append('file', `data:${mimeType};base64,${base64Data}`);
      formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!);
      
      // Add API key and timestamp (if available)
      if (process.env.CLOUDINARY_API_KEY) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', process.env.CLOUDINARY_API_KEY); // Note: API Secret is needed for signing, but Cloudflare Workers often handle this differently or use unsigned uploads
        // In a secure server environment, you would compute and append a signature:
        // const signature = computeSignature({ public_id, timestamp, ...other_params }, this.CLOUDINARY_API_SECRET);
        // formData.append('signature', signature);
      }
      
      // If a custom ID is provided, add it to the request
      if (customId) {
        formData.append('public_id', customId);
      }
      
      // Add metadata
      if (metadata) {
        // Cloudinary can use context parameter for metadata
        const contextPairs = Object.entries(metadata)
          .map(([key, value]) => `${key}=${value}`)
          .join('|');
        if (contextPairs) {
          formData.append('context', contextPairs);
        }
        
        // If metadata includes folder, handle separately
        if (metadata.folder) {
          formData.append('folder', metadata.folder);
        }
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      console.log(`CloudinaryImages: Base64 upload response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('CloudinaryImages: Base64 upload failed', errorData);
        throw new Error(`Failed to upload image from Base64: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json() as { 
        public_id: string; 
        created_at: string;
        secure_url: string;
      };
      
      console.log(`CloudinaryImages: Base64 upload successful, image ID: ${result.public_id}`);
      
      return {
        id: result.public_id,
        uploadedAt: result.created_at,
        url: result.secure_url
      };
    } catch (error) {
      console.error('CloudinaryImages: Error during Base64 upload:', error);
      throw error instanceof Error ? error : new Error('Unknown error during image Base64 upload');
    }
  }