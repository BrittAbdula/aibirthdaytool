# Neon 免费套餐优化方案

根据当前账单（约 187 CU-hours 计算 + 0.527 GB 存储），要迁到 [Neon Free 计划](https://neon.tech/docs/introduction/plans) 需满足：

| 指标 | 免费额度 | 当前约值 | 需优化 |
|------|----------|----------|--------|
| **Compute (CU-hours)** | 100/项目/月 | 187.29 | 约减 47% |
| **Storage (root)** | 0.5 GB/项目 | 0.527 GB | 约减 27 MB |

---

## 一、计算用量（CU-hours）优化

### 1. 使用连接池（必做）

- **现状**：应用通过 `DATABASE_URL` 直连（无 `-pooler`），每个 Serverless 请求可能占用独立连接，不利于 scale-to-zero。
- **做法**：
  - 应用运行时使用 **Pooled 连接**（`-pooler` 的 URL）。
  - Prisma 迁移/内省使用 **Direct 连接**（通过 `directUrl`）。
- **效果**：短连接、少占连接数，计算更容易在 5 分钟无活动后 scale to zero，从而显著降低 CU-hours。

已在本项目中：
- 在 `prisma/schema.prisma` 中配置 `directUrl`，迁移使用直连。
- 将 `DATABASE_URL` 改为 Pooler 地址（见下方「环境变量」）。

### 2. 关闭生产环境 Prisma 查询日志（必做）

- **现状**：`src/lib/prisma.ts` 中 `log: ['query']` 在生产和开发都开启。
- **做法**：仅在开发环境启用 `log: ['query']`，生产关闭。
- **效果**：减少 I/O 与不必要的连接占用，有利于 scale-to-zero。

### 3. 避免长连接与定时任务

- Free 计划 **5 分钟无活动后** scale to zero；若有长连接或高频定时任务，计算会长期唤醒，容易超 100 CU-hours。
- **建议**：
  - 不要用同一 Neon 库做「每分钟/每几分钟」的 cron（如 Vercel Cron 频繁打 DB）。
  - 如有 cron，尽量拉长间隔（如每日一次）或迁到不依赖 Neon 的服务。
- 当前代码库未发现 cron 配置，部署时注意不要在 Vercel 等平台设置高频 DB 轮询。

### 4. 可选：Neon Serverless Driver + Adapter

- 若仍超 100 CU-hours，可考虑 [Prisma + Neon 推荐方式](https://neon.tech/docs/guides/prisma)：使用 `@prisma/adapter-neon` 与 Neon serverless driver，连接更短、更适配 serverless。
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
- [ ] Neon Console 中无多余 child branches，或已删除
- [ ] 存储已通过清理/归档控制在 ≤0.5 GB（可在 Console 查看当前用量）
- [ ] 无高频 cron 或长连接保持 Neon 计算常开
- [ ] 可选：冷启动明显时在 `DATABASE_URL` 增加 `connect_timeout=15`

完成以上项后，再在 Neon 控制台将计划改为 Free，并持续观察首月的 **Compute** 与 **Storage** 用量是否落在免费额度内。
