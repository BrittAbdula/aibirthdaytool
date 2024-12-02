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

export async function uploadSvgToR2(svgContent: string, cardId: string): Promise<string> {
    try {
        const key = `cards/${cardId}.svg`;
        
        await r2Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: svgContent,
                ContentType: 'image/svg+xml',
            })
        );

        return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    } catch (error) {
        console.error('R2 upload error details:', {
            error,
            accountId: R2_ACCOUNT_ID,
            bucketName: R2_BUCKET_NAME
        });
        throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}