-- Add indexes used by public gallery ranking and tab filters.
CREATE INDEX "UserAction_card_action_time_idx" ON "UserAction"("cardId", "action", "timestamp");

CREATE INDEX "EditedCard_gallery_filter_idx" ON "EditedCard"("isPublic", "deleted", "cardType", "relationship", "createdAt");
CREATE INDEX "EditedCard_gallery_model_idx" ON "EditedCard"("isPublic", "deleted", "model", "createdAt");
CREATE INDEX "EditedCard_gallery_group_idx" ON "EditedCard"("isPublic", "deleted", "originalCardId", "createdAt");
