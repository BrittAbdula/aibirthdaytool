import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path if necessary

export async function GET(request: Request) {
    return NextResponse.json({ message: 'Hello, world!' });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, msg, data } = body;

        if (!data || !data.taskId || !data.info) {
             console.error('Webhook received with invalid data structure:', body);
            return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
        }

        const { taskId, info } = data;
        const { result_urls } = info;

        console.log(`<---- Webhook received for Task ID: ${taskId}, Status Code: ${code}, Message: ${msg} ---->`);

        let status = 'processing'; // Default status
        let r2Url = null;
        let errorMessage = null;

        if (code === 200) {
            status = 'completed';
            if (result_urls && result_urls.length > 0) {
                 // Assuming the first URL in the list is the primary result
                r2Url = result_urls[0];
            } else {
                 // Task completed successfully but no image URL returned (unexpected)
                 status = 'failed';
                 errorMessage = 'Task completed but no image URL provided.';
                 console.error(`Task ${taskId} completed with code 200 but no result_urls.`);
            }
        } else {
            status = 'failed';
            errorMessage = msg || `Task failed with code ${code}`;
             console.error(`Task ${taskId} failed with code ${code}: ${errorMessage}`);
        }


        // Find the record by taskId and update its status and r2Url
        const updatedRecord = await prisma.apiLog.update({
            where: { taskId: taskId }, // Assuming taskId is a unique field in ApiLog
            data: {
                status: status,
                r2Url: r2Url,
                errorMessage: errorMessage,
            },
        });

        console.log(`<---- Database updated for Task ID: ${taskId}, New Status: ${status} ---->`);

        return NextResponse.json({ success: true, updatedRecord });

    } catch (error: any) {
        console.error('Error handling webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}