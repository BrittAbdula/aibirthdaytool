/**
 * 数据库清理脚本
 * 
 * 功能：
 * 1. 删除 EditedCard 中超过一年且没有 copy/download/send/up 行为的卡片
 * 2. 同时删除关联的 ApiLog 记录
 * 3. 删除 ApiLog 中有但 EditedCard 没有的记录
 * 
 * 运行：npx ts-node scripts/cleanup-old-cards.ts
 * 
 * 注意：执行前请确保已备份数据库！
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient, Prisma } from '@prisma/client'

// 使用直连 URL 执行清理脚本
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
const urlWithTimeout = dbUrl.includes('connect_timeout') 
  ? dbUrl 
  : dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: urlWithTimeout
    }
  }
})

async function main() {
  console.log('=== 数据库清理脚本 ===\n')

  // 一年前的日期
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  console.log(`基准日期（一年前）: ${oneYearAgo.toISOString()}\n`)

  // ============================================
  // 清理前统计
  // ============================================
  console.log('--- 清理前统计 ---')
  const beforeEditedCardCount = await prisma.editedCard.count()
  const beforeApiLogCount = await prisma.apiLog.count()
  const beforeUserActionCount = await prisma.userAction.count()
  console.log(`EditedCard 数量: ${beforeEditedCardCount}`)
  console.log(`ApiLog 数量: ${beforeApiLogCount}`)
  console.log(`UserAction 数量: ${beforeUserActionCount}`)

  // ============================================
  // 步骤 1: 使用原生 SQL 删除超过一年且无用户行为的 EditedCard
  // ============================================
  console.log('\n--- 步骤 1: 删除超过一年且无用户行为的 EditedCard ---')

  // 首先查找需要删除的数量
  const countToDelete = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM "EditedCard" ec
    WHERE ec."createdAt" < ${oneYearAgo}
      AND ec."deleted" = false
      AND NOT EXISTS (
        SELECT 1 FROM "UserAction" ua 
        WHERE ua."cardId" = ec."originalCardId"
          AND ua."action" IN ('copy', 'download', 'send', 'up')
      )
  `
  console.log(`需要删除的 EditedCard 数量: ${countToDelete[0].count}`)

  if (Number(countToDelete[0].count) > 0) {
    // 获取需要删除的 EditedCard 的 originalCardId（用于后续清理 ApiLog）
    const cardsToDelete = await prisma.$queryRaw<{ id: string, originalCardId: string }[]>`
      SELECT ec."id", ec."originalCardId"
      FROM "EditedCard" ec
      WHERE ec."createdAt" < ${oneYearAgo}
        AND ec."deleted" = false
        AND NOT EXISTS (
          SELECT 1 FROM "UserAction" ua 
          WHERE ua."cardId" = ec."originalCardId"
            AND ua."action" IN ('copy', 'download', 'send', 'up')
        )
    `
    
    // 收集需要检查的 originalCardId
    const originalCardIds = Array.from(new Set(cardsToDelete.map(c => c.originalCardId)))
    const editedCardIds = cardsToDelete.map(c => c.id)
    
    console.log(`涉及的 originalCardId 数量: ${originalCardIds.length}`)

    // 删除 EditedCard
    const deletedEditedCards = await prisma.$executeRaw`
      DELETE FROM "EditedCard"
      WHERE "createdAt" < ${oneYearAgo}
        AND "deleted" = false
        AND NOT EXISTS (
          SELECT 1 FROM "UserAction" ua 
          WHERE ua."cardId" = "EditedCard"."originalCardId"
            AND ua."action" IN ('copy', 'download', 'send', 'up')
        )
    `
    console.log(`已删除 EditedCard: ${deletedEditedCards} 条`)

    // 检查这些 originalCardId 是否还被其他 EditedCard 引用
    if (originalCardIds.length > 0) {
      // 分批处理，每批 1000 个
      const batchSize = 1000
      let totalDeletedApiLogs = 0
      let totalDeletedUserActions = 0

      for (let i = 0; i < originalCardIds.length; i += batchSize) {
        const batch = originalCardIds.slice(i, i + batchSize)
        
        // 找出不再被引用的 cardId
        const stillReferenced = await prisma.editedCard.findMany({
          where: { originalCardId: { in: batch } },
          select: { originalCardId: true },
          distinct: ['originalCardId']
        })
        const stillReferencedSet = new Set(stillReferenced.map(c => c.originalCardId))
        const toDelete = batch.filter(id => !stillReferencedSet.has(id))

        if (toDelete.length > 0) {
          // 删除 UserAction
          const deletedUA = await prisma.userAction.deleteMany({
            where: { cardId: { in: toDelete } }
          })
          totalDeletedUserActions += deletedUA.count

          // 删除 ApiLog
          const deletedAL = await prisma.apiLog.deleteMany({
            where: { cardId: { in: toDelete } }
          })
          totalDeletedApiLogs += deletedAL.count
        }
      }
      console.log(`已删除关联的 UserAction: ${totalDeletedUserActions} 条`)
      console.log(`已删除关联的 ApiLog: ${totalDeletedApiLogs} 条`)
    }
  } else {
    console.log('没有需要删除的 EditedCard')
  }

  // ============================================
  // 步骤 2: 删除 ApiLog 中孤立的记录（无对应 EditedCard）
  // ============================================
  console.log('\n--- 步骤 2: 删除 ApiLog 中孤立的记录 ---')

  // 查找孤立的 ApiLog 数量
  const orphanedCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM "ApiLog" al
    WHERE NOT EXISTS (
      SELECT 1 FROM "EditedCard" ec 
      WHERE ec."originalCardId" = al."cardId"
    )
  `
  console.log(`孤立的 ApiLog 数量: ${orphanedCount[0].count}`)

  if (Number(orphanedCount[0].count) > 0) {
    // 获取孤立的 cardId
    const orphanedLogs = await prisma.$queryRaw<{ cardId: string }[]>`
      SELECT al."cardId"
      FROM "ApiLog" al
      WHERE NOT EXISTS (
        SELECT 1 FROM "EditedCard" ec 
        WHERE ec."originalCardId" = al."cardId"
      )
    `
    const orphanedCardIds = orphanedLogs.map(l => l.cardId)

    // 分批删除
    const batchSize = 1000
    let totalDeletedOrphanedUA = 0
    let totalDeletedOrphanedAL = 0

    for (let i = 0; i < orphanedCardIds.length; i += batchSize) {
      const batch = orphanedCardIds.slice(i, i + batchSize)
      
      // 删除 UserAction
      const deletedUA = await prisma.userAction.deleteMany({
        where: { cardId: { in: batch } }
      })
      totalDeletedOrphanedUA += deletedUA.count

      // 删除 ApiLog
      const deletedAL = await prisma.apiLog.deleteMany({
        where: { cardId: { in: batch } }
      })
      totalDeletedOrphanedAL += deletedAL.count
    }
    console.log(`已删除孤立记录的 UserAction: ${totalDeletedOrphanedUA} 条`)
    console.log(`已删除孤立的 ApiLog: ${totalDeletedOrphanedAL} 条`)
  } else {
    console.log('没有孤立的 ApiLog 需要删除')
  }

  // ============================================
  // 最终统计
  // ============================================
  console.log('\n=== 清理完成 ===')
  
  const finalEditedCardCount = await prisma.editedCard.count()
  const finalApiLogCount = await prisma.apiLog.count()
  const finalUserActionCount = await prisma.userAction.count()
  
  console.log(`\n清理前 -> 清理后：`)
  console.log(`EditedCard: ${beforeEditedCardCount} -> ${finalEditedCardCount} (删除 ${beforeEditedCardCount - finalEditedCardCount})`)
  console.log(`ApiLog: ${beforeApiLogCount} -> ${finalApiLogCount} (删除 ${beforeApiLogCount - finalApiLogCount})`)
  console.log(`UserAction: ${beforeUserActionCount} -> ${finalUserActionCount} (删除 ${beforeUserActionCount - finalUserActionCount})`)
  
  console.log('\n建议：在 Neon SQL Editor 执行 VACUUM ANALYZE; 以回收空间')
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
