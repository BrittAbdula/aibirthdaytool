-- 检查 id 列是否存在，如果不存在则添加
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Account' 
        AND column_name = 'id'
    ) THEN
        ALTER TABLE "Account" ADD COLUMN "id" TEXT;
        -- 为现有记录生成 UUID
        UPDATE "Account" SET "id" = gen_random_uuid()::TEXT WHERE "id" IS NULL;
        -- 设置 NOT NULL 约束
        ALTER TABLE "Account" ALTER COLUMN "id" SET NOT NULL;
        -- 添加主键约束
        ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
    END IF;
END $$;
