-- Create ApiLog table
CREATE TABLE IF NOT EXISTS "ApiLog" (
    "id" SERIAL PRIMARY KEY,
    "cardId" TEXT UNIQUE NOT NULL,
    "cardType" TEXT NOT NULL,
    "userInputs" JSONB NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "responseContent" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isError" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "r2Url" TEXT,
    "userId" TEXT,
    "modificationFeedback" TEXT
);

-- Create Template table
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "promptVersion" TEXT  NULL,
    "name" TEXT  NULL,
    "description" TEXT  NULL,
    "previewSvg" TEXT  NULL,
    "promptContent" TEXT  NULL,
    "r2Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create UserAction table
CREATE TABLE IF NOT EXISTS "UserAction" (
    "id" TEXT PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create EditedCard table
CREATE TABLE IF NOT EXISTS "EditedCard" (
    "id" TEXT PRIMARY KEY,
    "originalCardId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "model" TEXT,
    "relationship" TEXT,
    "editedContent" TEXT NOT NULL,
    "spotifyTrackId" TEXT,
    "r2Url" TEXT,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "requirements" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "EditedCard_originalCardId_idx" ON "EditedCard"("originalCardId");

-- create DeletedCard table
CREATE TABLE IF NOT EXISTS "DeletedCard" (
    "id" TEXT PRIMARY KEY,
    "editedCardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalCardId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "relationship" TEXT,
    "r2Url" TEXT,
    "fileDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create SpotifyMusic table
DROP TABLE IF EXISTS "SpotifyMusic";
CREATE TABLE "SpotifyMusic" (
    "id" TEXT PRIMARY KEY,
    "cardType" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "previewUrl" TEXT,
    "imageUrl" TEXT,
    "selectCount" INTEGER NOT NULL DEFAULT 0,
    "lastSelected" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SpotifyMusic_cardType_spotifyId_key" ON "SpotifyMusic"("cardType", "spotifyId");
CREATE INDEX IF NOT EXISTS "SpotifyMusic_cardType_selectCount_idx" ON "SpotifyMusic"("cardType", "selectCount");

-- Create StripeLog table
CREATE TABLE "StripeLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "eventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "objectId" TEXT NOT NULL,
  "objectType" TEXT NOT NULL,
  "amount" INTEGER,
  "currency" TEXT,
  "status" TEXT,
  "paymentMethod" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "rawData" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StripeLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StripeLog_eventId_key" UNIQUE ("eventId")
);

-- Create foreign key relationship
ALTER TABLE "StripeLog" ADD CONSTRAINT "StripeLog_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX "StripeLog_userId_idx" ON "StripeLog"("userId");
CREATE INDEX "StripeLog_eventType_idx" ON "StripeLog"("eventType");
CREATE INDEX "StripeLog_objectId_idx" ON "StripeLog"("objectId");
CREATE INDEX "StripeLog_createdAt_idx" ON "StripeLog"("createdAt");

-- 创建 PlanType 枚举类型
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
