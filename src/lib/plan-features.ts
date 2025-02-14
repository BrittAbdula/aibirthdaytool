import { prisma } from './prisma';
import { PlanType } from '@prisma/client';

export const FEATURE_KEYS = {
  DAILY_GENERATIONS: 'daily_generations',
  MONTHLY_GENERATIONS: 'monthly_generations',
  BATCH_GENERATION: 'batch_generation',
  PRIORITY_QUEUE: 'priority_queue',
  ADVANCED_EDITING: 'advanced_editing',
  API_ACCESS: 'api_access',
  PRIVACY_MODE: 'privacy_mode',
  AD_FREE: 'ad_free'
} as const;

export const DEFAULT_FEATURES = [
  {
    name: '每日生成次数',
    description: '每天可以生成的卡片数量',
    featureKey: FEATURE_KEYS.DAILY_GENERATIONS,
    limits: {
      [PlanType.FREE]: { value: 3, type: 'daily' },
      [PlanType.BASIC]: { value: 1000, type: 'monthly' },
      [PlanType.PREMIUM]: { value: 3000, type: 'monthly' }
    }
  },
  {
    name: '批量生成',
    description: '一次可以生成多张不同风格的卡片',
    featureKey: FEATURE_KEYS.BATCH_GENERATION,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 1, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  },
  {
    name: '优先生成队列',
    description: '优先处理您的生成请求',
    featureKey: FEATURE_KEYS.PRIORITY_QUEUE,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 1, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  },
  {
    name: '高级编辑功能',
    description: '使用高级编辑工具优化您的卡片',
    featureKey: FEATURE_KEYS.ADVANCED_EDITING,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 1, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  },
  {
    name: 'API访问',
    description: '通过API集成到您的应用中',
    featureKey: FEATURE_KEYS.API_ACCESS,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 0, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  },
  {
    name: '隐私模式',
    description: '生成的卡片仅自己可见',
    featureKey: FEATURE_KEYS.PRIVACY_MODE,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 1, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  },
  {
    name: '无广告体验',
    description: '完全无广告的使用体验',
    featureKey: FEATURE_KEYS.AD_FREE,
    limits: {
      [PlanType.FREE]: { value: 0, type: 'boolean' },
      [PlanType.BASIC]: { value: 1, type: 'boolean' },
      [PlanType.PREMIUM]: { value: 1, type: 'boolean' }
    }
  }
];

export async function initializePlanFeatures() {
  try {
    // Create features
    for (const feature of DEFAULT_FEATURES) {
      const existingFeature = await prisma.planFeature.findUnique({
        where: { featureKey: feature.featureKey }
      });

      if (!existingFeature) {
        const createdFeature = await prisma.planFeature.create({
          data: {
            name: feature.name,
            description: feature.description,
            featureKey: feature.featureKey
          }
        });

        // Create limits for each plan type
        for (const [planType, limit] of Object.entries(feature.limits)) {
          await prisma.planLimit.create({
            data: {
              planType: planType as PlanType,
              featureId: createdFeature.id,
              limitValue: limit.value,
              limitType: limit.type
            }
          });
        }
      }
    }

    console.log('Plan features initialized successfully');
  } catch (error) {
    console.error('Error initializing plan features:', error);
    throw error;
  }
}

export async function updatePlanFeature(
  featureKey: string,
  planType: PlanType,
  limitValue: number
) {
  const feature = await prisma.planFeature.findUnique({
    where: { featureKey }
  });

  if (!feature) {
    throw new Error(`Feature ${featureKey} not found`);
  }

  await prisma.planLimit.update({
    where: {
      planType_featureId: {
        planType,
        featureId: feature.id
      }
    },
    data: {
      limitValue
    }
  });
} 