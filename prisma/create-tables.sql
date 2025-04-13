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
    "errorMessage" TEXT,
    "r2Url" TEXT,
    "userId" TEXT
);

CREATE TABLE IF NOT EXISTS "ApiLog2" (
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
    "errorMessage" TEXT,
    "userId" TEXT
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
    "relationship" TEXT,
    "editedContent" TEXT NOT NULL,
    "spotifyTrackId" TEXT,
    "r2Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "EditedCard_originalCardId_idx" ON "EditedCard"("originalCardId");

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


-- 创建 PlanType 枚举类型
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM');