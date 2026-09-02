import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { grantAdReward } from '@/lib/pricing/entitlements';
import { describeQuota } from '@/lib/pricing/quota';
import { recordMonetizationEvent } from '@/lib/monetization';
import { getCountryCodeFromHeaders } from '@/lib/credits';

export const dynamic = 'force-dynamic';

/**
 * Grants a card for watching a rewarded ad.
 *
 * The cap and the grant both live server-side: the client only reports that an
 * ad finished, and a client that lies still cannot exceed the daily cap.
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const result = await grantAdReward(userId);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.reason,
          message:
            result.reason === 'cap_reached'
              ? "That's all the ad rewards for today. A card pack has no daily cap."
              : 'Your plan already includes unlimited cards.',
        },
        { status: 429 }
      );
    }

    await recordMonetizationEvent({
      eventType: 'ad_reward_earned',
      userId,
      source: 'ad_reward',
      metadata: {
        cardsEarned: result.cardsEarned,
        country: getCountryCodeFromHeaders(request.headers) ?? 'ZZ',
      },
    });

    return NextResponse.json({
      cardsEarned: result.cardsEarned,
      cardsRemaining: result.quota.totalRemaining,
      canEarnAdReward: result.quota.adCardsAvailableToEarn > 0,
      adRewardsLeftToday: result.quota.adCardsAvailableToEarn,
      label: describeQuota(result.quota),
    });
  } catch (error) {
    console.error('Failed to grant ad reward:', error);
    return NextResponse.json({ error: 'Failed to grant reward' }, { status: 500 });
  }
}
