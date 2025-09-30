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
    credits: 1,
    icon: '✨',
    badge: null,
    features: ['Animated SVG', 'Fast generation', 'All card types']
  },
  {
    id: 'Free_Image',
    name: 'Basic Static',
    description: 'High-quality static card images',
    time: '5 sec',
    format: 'image',
    tier: 'Free',
    credits: 6,
    icon: '🎨',
    badge: 'Fast',
    features: ['Static image', 'Quick delivery', 'Standard quality']
  },
  {
    id: 'Premium_SVG',
    name: 'Pro Animated',
    description: 'Enhanced animated cards with premium effects',
    time: '15 sec',
    format: 'svg',
    tier: 'Premium',
    credits: 5,
    icon: '🌟',
    badge: 'Premium',
    features: ['Advanced animations', 'Premium effects', 'Higher quality']
  },
  {
    id: 'Premium_Image',
    name: 'Pro Static',
    description: 'Ultimate quality static cards with premium styling',
    time: '10 sec',
    format: 'image',
    tier: 'Premium',
    credits: 6,
    icon: '💎',
    badge: 'Premium',
    features: ['Premium quality', 'Advanced styling', 'High resolution']
  },
  {
    id: 'Premium_Video_Fast',
    name: 'Pro Video Fast',
    description: 'Dynamic video cards with smooth animations and effects',
    time: '45 sec',
    format: 'video',
    tier: 'Premium',
    credits: 15,
    icon: '🎬',
    badge: 'Premium',
    features: ['HD video output', 'Dynamic animations', 'Professional effects']
  },
  {
    id: 'Premium_Video_Pro',
    name: 'Pro Video Ultimate',
    description: 'Ultra-premium video cards with cinematic quality',
    time: '90 sec',
    format: 'video',
    tier: 'Premium',
    credits: 25,
    icon: '🎥',
    badge: 'Premium',
    features: ['4K video output', 'Cinematic effects', 'Ultimate quality']
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
