# AI Birthday Tool

A modern web application for generating personalized greeting cards using AI technology. The application supports various card types including birthday cards, love cards, anniversary cards, and more.

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 for media storage
- **Dependencies**: 
  - Framer Motion for animations
  - Canvas Confetti for effects
  - Various Radix UI components for UI elements

## Project Structure

```
aibirthdaytool/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configurations
│   ├── styles/          # Global styles and CSS modules
│   └── script/          # Helper scripts
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── extension/           # Browser extension related files
```

## Core Features

### Card Generation
- Support for multiple card types (birthday, love, anniversary, etc.)
- Customizable templates with different styles
- AI-powered content generation
- Spotify integration for music selection

### User Experience
- Intuitive form-based card customization
- Real-time preview
- Mobile-responsive design
- Modern UI components from Radix UI

### Technical Features
- Server-side rendering with Next.js
- Type-safe development with TypeScript
- Efficient database queries with Prisma
- Secure file storage with AWS S3
- Optimized performance with Next.js Image optimization

## Database Schema

The application uses a PostgreSQL database with the following main tables:
- `Template`: Stores card templates with prompts and preview SVGs
- `EditedCard`: Stores user-generated cards with customizations
- `ApiLog`: Tracks API usage and performance

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```
Copy .env.local.example to .env.local and fill in required values
```

3. Initialize database:
```bash
pnpm prisma generate
```

4. Run development server:
```bash
pnpm dev
```

## Development Workflow

- Use `pnpm dev` for local development
- Database changes require running `pnpm prisma generate`
- Build production version with `pnpm build`
- Start production server with `pnpm start`

## Architecture

### Frontend
- Component-based architecture using React
- Server and client components for optimal performance
- Global state management using React hooks
- Responsive design with Tailwind CSS

### Backend
- API Routes for server-side operations
- Database operations through Prisma client
- File storage handled via AWS S3
- Type-safe API endpoints

### Data Flow
1. User inputs card details through the UI
2. Data is validated and processed by API routes
3. AI generates card content based on templates
4. Results are stored in the database
5. Generated cards can be previewed and shared

## Security Features
- Environment variable protection
- API rate limiting
- Secure file upload handling
- Type-safe database operations
