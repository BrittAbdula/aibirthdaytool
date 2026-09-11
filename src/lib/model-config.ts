// lib/model-config.ts
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  time: string;
  format: 'svg' | 'image' | 'video';
  tier: 'Free' | 'Premium';
  credits: number;
  icon: string;
  badge: string | null;
  features: string[];
}

export const modelConfigs: ModelConfig[] = [
  {
    id: 'Free_SVG',
    name: 'Basic Animated',
    description: 'Perfect for simple, beautiful animated cards',
    time: '10 sec',
    format: 'svg',
    tier: 'Free',
    credits: 2,
    icon: '✨',
    badge: null,
    features: ['Animated SVG', 'Fast generation', 'All card types']
  },
  {
    id: 'Free_Image',
    name: 'Basic Static',
    description: '1K images with clear lettering and optional photo references',
    time: 'May take a few minutes',
    format: 'image',
    tier: 'Free',
    credits: 6,
    icon: '🎨',
    badge: null,
    features: ['1K resolution', 'Clear lettering', 'Photo references']
  },
  {
    id: 'Premium_SVG',
    name: 'Pro Animated',
    description: 'Enhanced animated cards with premium effects',
    time: '15 sec',
    format: 'svg',
    tier: 'Premium',
    credits: 6,
    icon: '🌟',
    badge: 'Premium',
    features: ['Advanced animations', 'Premium effects', 'Higher quality']
  },
  {
    id: 'Premium_Image',
    name: 'Pro Static',
    description: '2K images for finer details, crisp lettering, and photo references',
    time: 'May take a few minutes',
    format: 'image',
    tier: 'Premium',
    credits: 6,
    icon: '💎',
    badge: 'Premium',
    features: ['2K resolution', 'Clear lettering', 'Photo references']
  },
  {
    id: 'Premium_Video_Fast',
    name: 'Short Video',
    description: '3-second vertical video · 9:16 · 480P',
    time: 'May take a few minutes',
    format: 'video',
    tier: 'Premium',
    credits: 6,
    icon: '🎬',
    badge: 'Premium',
    features: ['3-second video', '9:16 portrait', '480P resolution']
  },
  {
    id: 'Premium_Video_Pro',
    name: 'Short Video',
    description: '3-second vertical video · 9:16 · 480P',
    time: 'May take a few minutes',
    format: 'video',
    tier: 'Premium',
    credits: 6,
    icon: '🎥',
    badge: 'Premium',
    features: ['3-second video', '9:16 portrait', '480P resolution']
  }
];

// Helper function to get model config by ID
export const getModelConfig = (modelId: string): ModelConfig | undefined => {
  return modelConfigs.find(config => config.id === modelId);
};

// Helper function to get all models by tier
export const getModelsByTier = (tier: 'Free' | 'Premium'): ModelConfig[] => {
  return modelConfigs.filter(config => config.tier === tier);
};

// Helper function to create legacy modelTierMap for backward compatibility
export const createModelTierMap = () => {
  const map: Record<string, { time: string; cost: string; credits: number }> = {};
  
  modelConfigs.forEach(config => {
    map[config.id] = {
      time: config.time,
      cost: config.tier === 'Premium' ? 'Premium' : 'free',
      credits: config.credits
    };
  });
  
  return map;
}; 
