# Neon 费用与 CPU 优化方案

## 当前结论

本项目运行时已经使用 Neon pooled connection，`DIRECT_URL` 也已配置给 Prisma 迁移使用；生产环境 Prisma query log 也已关闭。当前 CPU 优化重点不是连接层，而是生产库索引缺失、统计信息过期、公开 gallery 查询实时聚合，以及部分列表接口读取宽字段。

只读诊断发现：

- `EditedCard` 实际约 119k 行，公开 gallery 约 63k 行、约 6.3k 个 `originalCardId` 分组。
- `UserAction` 实际约 171k 行，最近 120 天约 17.8k 行。
- 生产库未实际拥有 repo 中声明的 `EditedCard_gallery_*` 和 `UserAction_card_action_time_idx` 索引。
- 生产库 `EditedCard.id` 与 Prisma schema 的 `@id` 不一致，实际存在大量重复值；当前只能补非唯一 lookup 索引，主键修复需先做重复数据清理。
- `pg_stat_user_tables` 统计明显过期，关键表没有 `ANALYZE` 记录。
- `EditedCard.editedContent` 平均约 8KB，TOAST 约 227MB；列表读取应尽量只读 `r2Url` 和元数据。

历史账单约 187 CU-hours 计算 + 0.527 GB 存储。若目标是迁到 [Neon Free 计划](https://neon.tech/docs/introduction/plans)，仍需关注：

| 指标 | 免费额度 | 当前约值 | 需优化 |
|------|----------|----------|--------|
| **Compute (CU-hours)** | 100/项目/月 | 187.29 | 约减 47% |
| **Storage (root)** | 0.5 GB/项目 | 0.527 GB | 约减 27 MB |

---

## 一、计算用量（CU-hours）优化

### 1. 连接池状态（已完成）

- 应用运行时 `DATABASE_URL` 使用 `-pooler`。
- Prisma schema 已配置 `directUrl = env("DIRECT_URL")`。
- 生产 query log 已限制为开发环境。

连接池仍然重要，但它不能替代 SQL、索引和缓存优化。

### 2. 补齐 gallery / stats 索引（必做）

已新增 migration：

```text
prisma/migrations/20260603080000_neon_cpu_indexes/migration.sql
```

该 migration 使用 `CREATE INDEX CONCURRENTLY IF NOT EXISTS`，覆盖：

- public gallery 分组、筛选、model tab、recent 排序。
- 额外覆盖 type-only 与 relationship-only gallery 路由，避免 `cardType` 或 `relationship` 单独过滤时退回 `EditedCard` Parallel Seq Scan。
- `EditedCard_id_lookup_idx` 是非唯一索引，用于在生产数据去重前支撑按 id 回表；不要在未清理重复 id 前改成 unique/primary key。
- `UserAction` 最近行为聚合和用户发送记录查询。
- `ApiLog` 用户卡片、admin stats 时间范围查询。
- `EditedCard` 用户卡片和 custom URL 查询。

### 3. 刷新统计并启用查询观测（必做）

低峰期执行：

```bash
psql "$DIRECT_URL" -f scripts/neon-cpu-observability.sql
```

该脚本会：

- `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`
- `SELECT pg_stat_statements_reset();`
- `ANALYZE` gallery、action、stats、auth/log 相关表。
- 输出后续观测用的 top total execution time 查询。

执行后至少观察 24-72 小时，再看 `pg_stat_statements`、Neon Console CPU、CU-hours、active time。

### 4. 减少实时重查询（已在代码中调整）

- `/api/cards` 不再为无限滚动请求执行 `COUNT(DISTINCT originalCardId)`。
- gallery 查询多取一条判断 `hasMore`，返回 `nextCursor`，保留近似 `totalPages` 兼容旧调用。
- `/api/cards` 加 5 分钟公共缓存：`s-maxage=300, stale-while-revalidate=3600`。
- `recent` tab 改用 `DISTINCT ON (originalCardId)` 取每组最新卡片。
- `card-status` 发现 DB 已是 `completed` / `failed` 时直接返回，不再调用外部 provider。
- 前端生成状态轮询改为 1s / 3s / 5s 退避。
- admin stats 改为范围聚合，不再在 join 条件上 `to_char(timestamp)`。

### 5. 避免长连接与定时任务

- Free 计划 **5 分钟无活动后** scale to zero；若有长连接或高频定时任务，计算会长期唤醒，容易超 100 CU-hours。
- **建议**：
  - 不要用同一 Neon 库做「每分钟/每几分钟」的 cron（如 Vercel Cron 频繁打 DB）。
  - 如有 cron，尽量拉长间隔（如每日一次）或迁到不依赖 Neon 的服务。
- 当前代码库未发现 cron 配置，部署时注意不要在 Vercel 等平台设置高频 DB 轮询。

### 6. 可选：Neon Serverless Driver + Adapter

- 若完成索引、统计、缓存和轮询优化后仍超目标，可考虑 [Prisma + Neon 推荐方式](https://neon.tech/docs/guides/prisma)：使用 `@prisma/adapter-neon` 与 Neon serverless driver，连接更短、更适配 serverless。
- 需要安装依赖并改用 adapter 创建 `PrismaClient`，迁移继续用 `directUrl`。

---

## 二、存储（0.5 GB）优化

### 1. 控制在 0.5 GB 以内

- 当前 0.527 GB，约多 27 MB，需做轻度清理或归档。

### 2. 建议的存储优化手段

- **清理或归档旧数据**（在备份/确认无业务需求后再执行）：
  - `ApiLog`：删除或归档很久以前的日志（例如 1 年前的 `responseContent` 可只保留 ID/元数据，大文本迁到对象存储或不再保留）。
  - `EditedCard`：同样可对非常旧且不再展示的记录做归档或删除。
  - `StripeLog`：`rawData` 较大时可只保留近期完整 JSON，旧记录改为只保留 `eventId/eventType/objectId/amount` 等摘要。
- **减少大字段体积**：
  - 确保写入 `ApiLog.responseContent`、`Template.previewSvg`、`EditedCard.editedContent` 时不要重复存已存在 R2 的内容，可改为存 R2 URL。
  - 列表接口不要读取 `EditedCard.editedContent` 或 `ApiLog.responseContent`；仅编辑/详情页按需读取。
- **Neon Console**：
  - 在 [Neon Console](https://console.neon.tech) 的 Project → Branches 中删除不需要的 **child branches**（Free 仅 0.5 GB 针对 root，child 也会占存储）。
- **执行清理后**：在数据库执行 `VACUUM ANALYZE;`（或通过 Neon 提供的途径），以便统计与空间回收。

### 3. 示例：仅作参考的清理 SQL（执行前请备份并确认业务）

```sql
-- 查看各表大致大小（在 Neon SQL Editor 执行）
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 示例：删除 2 年前且无关联的 ApiLog（请按业务调整条件）
-- DELETE FROM "ApiLog" WHERE "timestamp" < NOW() - INTERVAL '2 years'
--   AND id NOT IN (SELECT "originalCardId" FROM "EditedCard" WHERE "originalCardId" IS NOT NULL);
-- 然后执行：VACUUM ANALYZE "ApiLog";
```

---

## 三、环境变量（.env / .env.local）

**本项目已修改 `prisma/schema.prisma` 使用 `directUrl`，因此必须配置 `DIRECT_URL`，否则 `prisma generate` / `prisma migrate` 会报错。**

请确保：

1. **应用运行时**使用 Pooler（减少连接数、利于 scale-to-zero）：

```bash
# 使用带 -pooler 的连接串（你现有的 POSTGRES_URL 即是）
DATABASE_URL="postgresql://default:YOUR_PASSWORD@ep-bold-cake-90628992-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require"
```

2. **Prisma 迁移 / 内省**使用直连（Neon 要求）：

```bash
# 直连（无 -pooler），仅给 Prisma migrate / db push 等使用（你当前 DATABASE_URL 的直连即可）
DIRECT_URL="postgresql://default:YOUR_PASSWORD@ep-bold-cake-90628992.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
```

3. **实际操作**：在 `.env.local` 中  
   - 把当前的 `DATABASE_URL` 值复制到 `DIRECT_URL`；  
   - 把 `DATABASE_URL` 改为当前 `POSTGRES_URL` 的值（pooler）。  
   这样运行时走连接池，迁移走直连。

---

## 四、免费计划其他限制（需留意）

- **Scale to zero**：5 分钟无活动后挂起，首请求可能有几百毫秒到几秒的冷启动；可在连接串加 `connect_timeout=15` 避免超时。
- **公网出口**：5 GB/月，若做大量导出或同步，需控制流量。
- **Autoscaling**：Free 最高 2 CU (8 GB RAM)，一般小型应用足够。

---

## 五、检查清单（切换免费套餐前）

- [ ] `DATABASE_URL` 使用 Pooler 连接串（含 `-pooler`）
- [ ] 已设置 `DIRECT_URL` 直连，且 `prisma/schema.prisma` 中 `directUrl` 指向 `DIRECT_URL`
- [ ] 生产环境已关闭 Prisma `log: ['query']`（见 `src/lib/prisma.ts`）
- [ ] 已低峰期执行 concurrent index migration
- [ ] 已执行 `scripts/neon-cpu-observability.sql`
- [ ] 已观察 24-72 小时 `pg_stat_statements` 和 Neon Console CPU/CU-hours
- [ ] Neon Console 中无多余 child branches，或已删除
- [ ] 存储已通过清理/归档控制在 ≤0.5 GB（可在 Console 查看当前用量）
- [ ] 无高频 cron 或长连接保持 Neon 计算常开
- [ ] 可选：冷启动明显时在 `DATABASE_URL` 增加 `connect_timeout=15`

完成以上项后，再在 Neon 控制台将计划改为 Free，并持续观察首月的 **Compute** 与 **Storage** 用量是否落在免费额度内。
