# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build production version (requires `pnpm run prisma:generate` first)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

### Database
- `pnpm prisma generate` - Generate Prisma client (required after schema changes)
- `pnpm postinstall` - Automatically runs `pnpm prisma generate`

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 (via `src/lib/r2.ts`)
- **Auth**: NextAuth.js with Google provider
- **Payments**: Stripe integration

### Core Structure
```
src/
├── app/                # Next.js App Router pages and API routes
│   ├── [cardType]/     # Dynamic card type pages
│   ├── api/            # API endpoints
│   └── my-cards/       # User dashboard
├── components/         # React components (using shadcn/ui pattern)
├── lib/                # Core business logic and utilities
│   ├── cards.ts        # Card data fetching with complex SQL queries
│   ├── prisma.ts       # Database client
│   ├── gpt.ts          # AI content generation
│   └── card-config.ts  # Card type configurations
└── hooks/              # Custom React hooks
```

### Database Schema
Key models:
- `ApiLog` - Stores AI-generated card data and metadata
- `EditedCard` - User-customized versions of cards (references ApiLog via originalCardId)
- `Template` - Card templates with prompts and preview SVGs
- `User` - User accounts with subscription plans (FREE/PREMIUM)
- `Subscription` - Stripe subscription management
- `UserAction` - Tracks user interactions (copy, download, send, up/like)

### Card Generation Flow
1. User selects card type and fills form (`src/components/CardGenerator.tsx`)
2. API generates content via AI (`src/app/api/generate-card/route.ts`)
3. Original card stored in `ApiLog`, user edits in `EditedCard`
4. Card gallery shows grouped cards by `originalCardId` (`src/lib/cards.ts`)

### Key Business Logic
- **Card Fetching**: Complex SQL queries in `src/lib/cards.ts` group cards by `originalCardId` and rank by popularity/recency
- **AI Generation**: Configurable prompts and models in `src/lib/gpt.ts` and `src/lib/model-config.ts`
- **Authentication**: NextAuth.js configuration in `src/auth.ts`
- **Subscription Logic**: Free vs premium tiers with usage tracking

### Code Style (from .cursorrules)
- Use TypeScript interfaces over types
- Prefer functional components and declarative patterns
- Use lowercase-with-dashes for directories
- Minimize 'use client' - favor React Server Components
- Use shadcn/ui and Radix UI for components
- Mobile-first Tailwind CSS approach

### Important Files
- `src/lib/card-config.ts` - Defines available card types and relationships
- `src/lib/cards.ts` - Core card data fetching with optimized queries
- `src/app/api/generate-card/route.ts` - Main AI generation endpoint
- `prisma/schema.prisma` - Database schema