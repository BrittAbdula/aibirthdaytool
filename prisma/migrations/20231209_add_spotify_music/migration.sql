-- CreateTable
CREATE TABLE "SpotifyMusic" (
    "id" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "previewUrl" TEXT,
    "imageUrl" TEXT,
    "selectCount" INTEGER NOT NULL DEFAULT 0,
    "lastSelected" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyMusic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyMusic_cardType_spotifyId_key" ON "SpotifyMusic"("cardType", "spotifyId");

-- CreateIndex
CREATE INDEX "SpotifyMusic_cardType_selectCount_idx" ON "SpotifyMusic"("cardType", "selectCount");
