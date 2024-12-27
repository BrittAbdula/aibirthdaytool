const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 源数据库的prisma客户端
const sourcePrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://default:KGmhFYr9ipk3@ep-bold-cake-90628992.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
        }
    }
});

// 目标数据库（Supabase）的连接池
const pool = new Pool({
    connectionString: "postgres://postgres.wiiihffhzacjyhbjxgle:0WessxDNPxeToOLv@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connection_limit=3",
    max: 1, // 限制最大连接数
    connectionTimeoutMillis: 10000, // 连接超时时间
    idleTimeoutMillis: 10000, // 空闲超时时间
    statement_timeout: 10000 // 查询超时时间
});

// 添加重试机制的包装函数
async function withRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`操作失败，第 ${i + 1} 次重试...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 递增重试延迟
        }
    }
}

async function importData() {
    const client = await pool.connect();
    try {
        console.log('开始导入数据到Supabase...');

        // 先执行修复表结构的SQL
        // console.log('修复表结构...');
        // const fixTablesSql = fs.readFileSync(path.join(__dirname, '../prisma/fix-tables.sql'), 'utf8');
        // await client.query(fixTablesSql);
        // console.log('表结构修复完成');

        // 修复SpotifyMusic表
        // console.log('修复SpotifyMusic表结构...');
        // const fixSpotifyTableSql = fs.readFileSync(path.join(__dirname, '../prisma/fix-spotify-table.sql'), 'utf8');
        // await client.query(fixSpotifyTableSql);
        // console.log('SpotifyMusic表结构修复完成');

        // // 1. 导入ApiLog
        // console.log('导入ApiLog...');
        // const apiLogs = await sourcePrisma.apiLog.findMany();
        // for (const log of apiLogs) {
        //     await withRetry(async () => {
        //         await client.query(
        //             `INSERT INTO "ApiLog" ("id", "cardId", "cardType", "userInputs", "promptVersion", "responseContent", "tokensUsed", "duration", "timestamp", "isError", "errorMessage", "r2Url")
        //              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        //              ON CONFLICT ("cardId") DO NOTHING`,
        //             [log.id, log.cardId, log.cardType, log.userInputs, log.promptVersion, log.responseContent, log.tokensUsed, log.duration, log.timestamp, log.isError, log.errorMessage, log.r2Url]
        //         );
        //     });
        // }
        // console.log(`已导入 ${apiLogs.length} 条 ApiLog 记录`);

        // 清空Template表
        // console.log('清空Template表...');
        // await client.query('TRUNCATE TABLE "Template" CASCADE');
        // console.log('Template表已清空');

        // 2. 导入Template
        // console.log('导入Template...');
        // const templates = await sourcePrisma.template.findMany();
        // let templateSuccessCount = 0;
        // let templateSkipCount = 0;
        // for (const template of templates) {
        //     try {
        //         await withRetry(async () => {
        //             await client.query(
        //                 `INSERT INTO "Template" ("id", "cardId", "cardType", "promptVersion", "name", "description", "previewSvg", "promptContent", "r2Url", "createdAt", "updatedAt")
        //                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        //                  ON CONFLICT ("id") DO NOTHING`,
        //                 [template.id, template.cardId, template.cardType, template.promptVersion, template.name, template.description, template.previewSvg, template.promptContent, template.r2Url, template.createdAt, template.updatedAt]
        //             );
        //             templateSuccessCount++;
        //         });
        //     } catch (error) {
        //         if (error.code === '23505') { // 唯一约束违反
        //             templateSkipCount++;
        //             console.log(`跳过Template记录 ${template.id}，原因：cardId ${template.cardId} 已存在`);
        //         } else {
        //             throw error;
        //         }
        //     }
        // }
        // console.log(`已导入 ${templateSuccessCount} 条 Template 记录，跳过 ${templateSkipCount} 条记录`);

        // // 3. 导入UserAction
        // console.log('导入UserAction...');
        // const userActions = await sourcePrisma.userAction.findMany();
        // for (const action of userActions) {
        //     await withRetry(async () => {
        //         await client.query(
        //             `INSERT INTO "UserAction" ("id", "cardId", "action", "timestamp")
        //              VALUES ($1, $2, $3, $4)
        //              ON CONFLICT ("id") DO NOTHING`,
        //             [action.id, action.cardId, action.action, action.timestamp]
        //         );
        //     });
        // }
        // console.log(`已导入 ${userActions.length} 条 UserAction 记录`);

       // 4. 导入EditedCard
        console.log('导入EditedCard...');
        const editedCards = await sourcePrisma.editedCard.findMany();
        let successCount = 0;
        let skipCount = 0;
        for (const card of editedCards) {
            try {
                await withRetry(async () => {
                    await client.query(
                        `INSERT INTO "EditedCard" ("id", "originalCardId", "cardType", "editedContent", "spotifyTrackId", "r2Url", "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         ON CONFLICT ("id") DO NOTHING`,
                        [card.id, card.originalCardId, card.cardType, card.editedContent, card.spotifyTrackId, card.r2Url, card.createdAt, card.updatedAt]
                    );
                });
                successCount++;
            } catch (error) {
                if (error.code === '23503') { // 外键约束违反
                    skipCount++;
                    console.log(`跳过记录 ${card.id}，原因：找不到对应的ApiLog记录`);
                } else {
                    throw error;
                }
            }
        }
        console.log(`已导入 ${successCount} 条 EditedCard 记录，跳过 ${skipCount} 条记录`);

        // 5. 导入SpotifyMusic
        // console.log('导入SpotifyMusic...');
        // const spotifyMusics = await sourcePrisma.spotifyMusic.findMany();
        // for (const music of spotifyMusics) {
        //     await withRetry(async () => {
        //         await client.query(
        //             `INSERT INTO "SpotifyMusic" ("id", "cardType", "spotifyId", "name", "artist", "previewUrl", "imageUrl", "selectCount", "lastSelected", "createdAt", "updatedAt")
        //              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        //              ON CONFLICT ("id") DO NOTHING`,
        //             [music.id, music.cardType, music.spotifyId, music.name, music.artist, music.previewUrl, music.imageUrl, music.selectCount, music.lastSelected, music.createdAt, music.updatedAt]
        //         );
        //     });
        // }
        // console.log(`已导入 ${spotifyMusics.length} 条 SpotifyMusic 记录`);

        console.log('所有数据导入完成！');

    } catch (error) {
        console.error('导入过程中发生错误:', error);
    } finally {
        client.release();
        await sourcePrisma.$disconnect();
        await pool.end();
    }
}

// 执行导入
importData();
