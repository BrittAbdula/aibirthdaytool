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

// ... existing code ...

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