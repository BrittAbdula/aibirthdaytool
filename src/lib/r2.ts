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