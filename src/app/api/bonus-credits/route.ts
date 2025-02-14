import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const addBonusSchema = z.object({
  amount: z.number().min(1),
  reason: z.string(),
  expiresAt: z.string().datetime().optional()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = addBonusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: result.error.format()
      }, { status: 400 });
    }

    const { amount, reason, expiresAt } = result.data;

    const bonusCredit = await prisma.bonusCredit.create({
      data: {
        userId: session.user.id,
        amount,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return NextResponse.json(bonusCredit);
  } catch (error) {
    console.error('Error adding bonus credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bonusCredits = await prisma.bonusCredit.findMany({
      where: {
        userId: session.user.id,
        isUsed: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalCredits = bonusCredits.reduce((sum, credit) => sum + credit.amount, 0);

    return NextResponse.json({
      credits: bonusCredits,
      total: totalCredits
    });
  } catch (error) {
    console.error('Error fetching bonus credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 