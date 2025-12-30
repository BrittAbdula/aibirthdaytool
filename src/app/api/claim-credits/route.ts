import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/claim-credits - Get user credits status
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

        // Get user info and today's usage
        const [user, usage] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { plan: true, createdAt: true },
            }),
            prisma.apiUsage.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: todayStart,
                    },
                },
            }),
        ]);

        const planType = user?.plan || 'FREE';
        const isFirstDay = !!user?.createdAt && user.createdAt >= todayStart;
        const isPremium = planType === 'PREMIUM';

        // Calculate credits
        const dailyCredits = isPremium ? Infinity : (isFirstDay ? 4 : 5);
        const usedCredits = usage?.count || 0;
        const availableCredits = isPremium ? Infinity : Math.max(0, dailyCredits - usedCredits);
        const hasClaimed = !!usage && !isFirstDay; // First day doesn't need claiming

        return NextResponse.json({
            success: true,
            isFirstDay,
            isPremium,
            availableCredits: isPremium ? 'unlimited' : availableCredits,
            usedCredits,
            dailyCredits: isPremium ? 'unlimited' : dailyCredits,
            hasClaimed: isFirstDay ? true : hasClaimed, // First day auto-claimed
            message: isFirstDay
                ? '✨ Welcome! You have 2 animated card creations today. More options unlock tomorrow!'
                : hasClaimed
                    ? `🎨 You have ${availableCredits} credits remaining today.`
                    : '🎁 Your daily credits are ready to claim!'
        });
    } catch (error) {
        console.error('Error fetching credits status:', error);
        return NextResponse.json({ error: 'Failed to fetch credits status' }, { status: 500 });
    }
}

// POST /api/claim-credits - Claim daily credits (creates usage record if not exists)
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true, createdAt: true },
        });

        const planType = user?.plan || 'FREE';
        const isFirstDay = !!user?.createdAt && user.createdAt >= todayStart;
        const isPremium = planType === 'PREMIUM';

        // Premium users don't need to claim
        if (isPremium) {
            return NextResponse.json({
                success: true,
                message: '💎 Premium members have unlimited credits!',
                availableCredits: 'unlimited',
                isPremium: true,
            });
        }

        // First-day users can't claim (they get their 4 credits automatically)
        if (isFirstDay) {
            return NextResponse.json({
                success: false,
                error: 'first_day',
                message: '🌟 Your welcome credits are already active! Come back tomorrow to claim more.',
                isFirstDay: true,
                availableCredits: 4,
            });
        }

        // Check if already claimed today
        const existingUsage = await prisma.apiUsage.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: todayStart,
                },
            },
        });

        if (existingUsage) {
            const remaining = Math.max(0, 5 - existingUsage.count);
            return NextResponse.json({
                success: true,
                alreadyClaimed: true,
                message: `🎨 Already claimed! You have ${remaining} credits left today.`,
                availableCredits: remaining,
                usedCredits: existingUsage.count,
            });
        }

        // Create usage record with 0 used (claiming activates the day)
        await prisma.apiUsage.create({
            data: {
                userId,
                date: todayStart,
                count: 0,
            },
        });

        return NextResponse.json({
            success: true,
            message: '🎉 Daily credits claimed! You now have 5 credits to create amazing cards.',
            availableCredits: 5,
            usedCredits: 0,
            claimed: true,
        });
    } catch (error) {
        console.error('Error claiming credits:', error);
        return NextResponse.json({ error: 'Failed to claim credits' }, { status: 500 });
    }
}
