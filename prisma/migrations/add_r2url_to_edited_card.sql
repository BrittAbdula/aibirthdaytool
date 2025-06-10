-- Add r2Url column to EditedCard table
ALTER TABLE "EditedCard" ADD COLUMN "r2Url" TEXT;

alter table "EditedCard" add column "recipientName" text;
alter table "EditedCard" add column "senderName" text;

