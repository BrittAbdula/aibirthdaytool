import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkPlanFeature } from '@/lib/plan-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkFeatureSchema = z.object({
  featureKey: z.string()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = checkFeatureSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: result.error.format()
      }, { status: 400 });
    }

    const { featureKey } = result.data;
    const featureCheck = await checkPlanFeature(session.user.id, featureKey);

    return NextResponse.json(featureCheck);
  } catch (error) {
    console.error('Error checking feature:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 