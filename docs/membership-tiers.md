# AI Birthday Card Generator - 会员等级体系

## 会员等级概览

| 功能特权           | 免费用户 | 高级会员 | 专业会员 |
|------------------|---------|---------|---------|
| 模板使用          | 是      | 是      | 是      |
| 生成次数          | 3次/每日  | 1000次/每月    | 3000次/每日    |
| 批量生成          | 否       | 是      | 是     |
| 广告展示           | 有      | 无      | 无      |
| 模型质量           | 基础    | 高级     | 高级    |
| 多轮编辑次数        | 否     | 3次     | 5次     |
| 优先生成队列        | 否      | 是      | 是      |
| 定价（月）          | 免费    | $9.99  | $19.99  |
| 定价（年）          | 免费    | $99.99  | $199.99    |

## 详细功能说明

### 1. 生成次数
- **免费用户**: 每日3次免费生成机会，体验基本功能
- **高级会员**: 每日10次，满足个人日常使用需求
- **专业会员**: 每日30次，适合商业用户和高频使用场景

### 2. 批量生成
- **免费用户**: 每次只能生成1张卡片
- **高级会员**: 每次可同时生成3张不同风格
- **专业会员**: 每次可同时生成5张不同风格

### 3. 模型质量
- **免费用户**: 基础模型，生成时间约15秒
- **高级会员**: 高级模型，生成时间约7秒
- **专业会员**: 最高质量模型，生成时间约5秒

### 4. 高级功能
- **多轮编辑**: 每张卡片可进行的编辑次数（消耗生成次数）
  - 免费用户：1次编辑机会
  - 高级会员：3次编辑机会
  - 专业会员：5次编辑机会
- **优先生成队列**: 高级会员及以上享受优先生成特权
- **高级编辑功能**: 高级会员及以上可使用高级图片编辑功能
- **API访问**: 仅专业会员可以通过API集成到自己的应用中

### 5. 其他特权
- **广告移除**: 所有付费会员均无广告展示
- **专属客服**: 所有付费会员享受优先客服支持
- **自定义模板**: 专业会员可以创建和保存自定义模板

## 技术实现建议

### 1. 数据库设计
```typescript
interface UserTier {
  id: string;
  name: 'FREE' | 'PREMIUM' | 'PRO';
  dailyGenerationLimit: number;
  batchGenerationLimit: number;
  editAttemptsPerCard: number;
  hasAds: boolean;
  modelQuality: 'basic' | 'premium' | 'ultimate';
  priorityQueue: boolean;
  advancedEditing: boolean;
  apiAccess: boolean;
}

interface UserSubscription {
  userId: string;
  tierId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentStatus: 'active' | 'cancelled' | 'expired';
  generationsToday: number;
  lastGenerationDate: Date;
}

interface CardEditHistory {
  cardId: string;
  userId: string;
  editCount: number;
  lastEditDate: Date;
  remainingEdits: number;
}
```

### 2. 功能限制实现
```typescript
interface GenerationLimits {
  checkUserLimits: (userId: string) => Promise<{
    canGenerate: boolean;
    remainingGenerations: number;
    batchSize: number;
    modelQuality: string;
  }>;
  
  incrementUserGeneration: (userId: string) => Promise<void>;
  
  resetDailyCounter: (userId: string) => Promise<void>;
  
  checkEditLimit: (userId: string, cardId: string) => Promise<{
    canEdit: boolean;
    remainingEdits: number;
  }>;
}
```

### 3. 性能优化
- 使用Redis缓存用户每日配额信息
- 实现异步队列系统，支持优先级生成
- 针对不同会员等级使用不同的计算资源池

## 营销建议

1. **转化策略**
   - 免费用户提供每日固定次数，让用户养成使用习惯
   - 高级会员针对个人用户，提供充足的每日使用量
   - 专业会员面向商业用户，提供完整解决方案

2. **促销活动**
   - 新用户首周高级会员体验
   - 年付享受优惠折扣
   - 节日特别优惠活动
   - 推荐计划返现

3. **用户留存**
   - 每日登录奖励额外生成次数
   - 会员专属活动
   - 积分奖励系统
   - 定期推送个性化优惠

// ... existing code for the rest of the sections ...