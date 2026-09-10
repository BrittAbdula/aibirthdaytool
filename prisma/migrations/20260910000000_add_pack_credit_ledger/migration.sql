-- Record actual balance changes atomically, including raw SQL consumption and
-- transactional Stripe grants. Pre-migration balances are opening snapshots,
-- not reconstructed transactions.
BEGIN;

CREATE TABLE "CreditLedger" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "amount" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "CreditLedger_userId_id_idx" ON "CreditLedger"("userId", "id");

CREATE FUNCTION record_pack_credit_change() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "CreditLedger" ("userId", "amount", "balanceAfter", "reason")
    VALUES (NEW.id, NEW."packCredits", NEW."packCredits", 'opening_balance');
  ELSIF NEW."packCredits" <> OLD."packCredits" THEN
    INSERT INTO "CreditLedger" ("userId", "amount", "balanceAfter", "reason")
    VALUES (NEW.id, NEW."packCredits" - OLD."packCredits", NEW."packCredits", 'balance_change');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Block concurrent balance updates until the opening snapshots and trigger
-- are both in place, so a change cannot fall between them.
LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO "CreditLedger" ("userId", "amount", "balanceAfter", "reason")
SELECT "id", "packCredits", "packCredits", 'opening_balance' FROM "User";
CREATE TRIGGER user_pack_credit_ledger
AFTER INSERT OR UPDATE OF "packCredits" ON "User"
FOR EACH ROW EXECUTE FUNCTION record_pack_credit_change();
COMMIT;
