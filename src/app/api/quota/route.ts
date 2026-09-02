import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/pricing/entitlements';
import { describeQuota } from '@/lib/pricing/quota';

export const dynamic = 'force-dynamic';

/**
 * What the quota meter renders. Signed-out visitors get the shape too, so the
 * generator can show the free allowance before anyone commits to signing in.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({
      signedIn: false,
      hasPaidAccess: false,
      unlimited: false,
      cardsRemaining: null,
      dailyAllowance: null,
      packRemaining: 0,
      canEarnAdReward: false,
      label: 'Sign in to start creating',
    });
  }

  try {
    const { tier, quota, hasPaidAccess } = await getEntitlements(session.user.id);

    return NextResponse.json({
      signedIn: true,
      tier,
      hasPaidAccess,
      unlimited: quota.unlimited,
      cardsRemaining: quota.unlimited ? null : quota.totalRemaining,
      dailyRemaining: quota.unlimited ? null : quota.dailyRemaining,
      dailyAllowance: quota.unlimited ? null : quota.dailyAllowance,
      packRemaining: quota.packRemaining,
      canEarnAdReward: quota.adCardsAvailableToEarn > 0,
      adRewardsLeftToday: quota.adCardsAvailableToEarn,
      label: describeQuota(quota),
    });
  } catch (error) {
    console.error('Failed to load quota:', error);
    return NextResponse.json({ error: 'Failed to load quota' }, { status: 500 });
  }
}
