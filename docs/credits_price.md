# Credits System Design

## Pricing Tiers

| Tier    | Monthly Price (USD) | Credits Included |
|---------|---------------------|------------------|
| Free    | $0                  | 5 daily          |
| Basic   | $2.99               | 100              |
| Pro     | $19.99              | 1000             |

## Model Costs

| Model ID            | Model Name          | Format | Credits |
|---------------------|---------------------|--------|---------|
| Free_SVG            | Basic Animated      | SVG    | 2       |
| Free_Image          | Basic Static        | Image  | 6       |
| Premium_SVG         | Pro Animated        | SVG    | 6       |
| Premium_Image       | Pro Static          | Image  | 6       |
| Premium_Video_Fast  | Pro Video Fast      | Video  | 6       |
| Premium_Video_Pro   | Pro Video Ultimate  | Video  | 15      |
| Banana Edit         | Reference Image Edit| Image  | 6       |

## Feature Costs (Legacy)

```typescript
const FEATURE_COSTS = {
  'basic_template_use': 0,        // Free to use basic templates
  'generate_card_basic_mode': 2,  // 2 credits per basic card generation (SVG)
  'generate_card_advanced_mode': 6 // 6 credits per advanced card generation (Image/Video)
} as const;
```

## Credits Rules

- Free tier users receive 5 new credits daily
- Unused credits from free tier do not accumulate (expire daily)
- Purchased credits expire after 1 year
- Credits are consumed in order of expiration (oldest first)

## Payment Integration

```typescript
// Payment and order tracking
model PaymentOrder {
  id              String           @id @default(cuid())
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  amount          Float            // Amount charged in currency
  currency        String           @default("USD")
  status          PaymentStatus    @default(PENDING)
  paymentMethod   String           // "stripe", "paypal", etc.
  paymentIntentId String?          // External payment ID (e.g., Stripe Payment Intent ID)
  metadata        Json?            // Additional payment details
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  creditsPurchase CreditsPurchase? // Related credits purchase (if payment successful)
  
  @@index([userId])
  @@index([status])
  @@index([paymentIntentId])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

// Subscription details (if using recurring billing)
model SubscriptionPlan {
  id              String         @id @default(cuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  planTier        String         // "basic" or "pro"
  status          String         @default("active")
  stripeCustomerId String?       // Stripe customer ID
  stripeSubscriptionId String?   // Stripe subscription ID
  currentPeriodStart DateTime    // Current billing period start
  currentPeriodEnd DateTime      // Current billing period end
  cancelAtPeriodEnd Boolean      @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([userId])
}
```

## Data Models

```typescript
// Tracks credit acquisitions
model CreditsPurchase {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  planTier  String    // "free", "basic", or "pro"
  amount    Int       // Number of credits received
  reason    String    // "subscription", "bonus", "daily", etc.
  createdAt DateTime  @default(now())
  expiresAt DateTime? // When these credits expire (null = never)
  used      Int       @default(0) // Credits already used from this purchase
  usages    CreditsUsage[] // All usage records for this purchase
  
  @@index([userId])
}

// Tracks credit consumption
model CreditsUsage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  purchaseId  String
  purchase    CreditsPurchase @relation(fields: [purchaseId], references: [id])
  amount      Int      // Credits consumed (positive number)
  feature     String   // The feature used (matches keys in FEATURE_COSTS)
  relatedId   String?  // Associated business data (e.g., card ID)
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([purchaseId])
}
```

## Implementation Notes

- Credit balance is calculated as sum of all purchases minus sum of all usages
- System should warn users when their balance is low (< 10 credits)
- When generating a card, check balance before proceeding
- Add a credits history page in the user dashboard
- Implement Stripe webhook handler for subscription and payment events
- Auto-provision credits when payments are successful
