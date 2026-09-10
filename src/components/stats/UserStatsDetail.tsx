'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { purchaseLabel, statsMoney, statsTime } from './PurchaseStats';
import type { UserStatsResponse, UserStatsSection } from '@/lib/stats-purchases';

export function UserStatsDetail({ userId }: { userId: string }) {
  const [section, setSection] = useState<UserStatsSection>('credits');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UserStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ section, order, page: String(page) });
    fetch(`/api/user-stats/users/${encodeURIComponent(userId)}?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(response.status === 401 ? '请先登录管理员账号' : response.status === 403 ? '需要管理员权限' : body.error || '用户记录加载失败');
        if (!controller.signal.aborted) setData(body);
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [userId, section, order, page, retry]);

  const empty = data && data[section].length === 0;
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Link href="/stats/" className="text-sm text-blue-600 underline">返回统计</Link>
      <Card>
        <CardHeader>
          <CardTitle>{data?.user.name || '用户详情'}</CardTitle>
          {data && <div className="space-y-1 text-sm text-slate-500"><p>{data.user.email || data.user.id}</p><p>当前卡包余额：<strong className="text-slate-900">{data.user.packCredits}</strong> 张 · 注册时间：{statsTime(data.user.createdAt)} UTC</p></div>}
          <p className="text-sm text-slate-500">展示该用户全部历史，不受统计页日期范围限制。时间均为 UTC。</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs value={section} onValueChange={value => { setSection(value as UserStatsSection); setPage(1); }}>
              <TabsList className="h-auto flex-wrap"><TabsTrigger value="credits">积分变动</TabsTrigger><TabsTrigger value="generations">生成列表</TabsTrigger><TabsTrigger value="purchases">购买记录</TabsTrigger><TabsTrigger value="usage">每日用量</TabsTrigger></TabsList>
            </Tabs>
            <label className="flex items-center gap-2 text-sm">时间顺序
              <select className="rounded-md border bg-white p-2" value={order} onChange={event => { setOrder(event.target.value as 'asc' | 'desc'); setPage(1); }}>
                <option value="desc">最新在前</option><option value="asc">最早在前</option>
              </select>
            </label>
          </div>
          {section === 'credits' && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">积分以卡包张数计。期初余额为流水功能启用时的快照；此前没有逐笔扣减记录，可在购买记录和每日用量中查看历史。流水中的增加包含充值、返还或调整，减少包含消费或调整。</p>}
          {section === 'usage' && <p className="text-sm text-slate-500">每日额度已用张数、广告奖励与旧积分口径分别展示；这里是每日汇总，不是逐笔流水，也不代表卡包消费量。</p>}
          {loading && <p role="status">正在加载…</p>}
          {error && <p role="alert" className="text-rose-600">{error} <Button variant="outline" onClick={() => setRetry(value => value + 1)}>重试</Button></p>}
          {!loading && !error && data && <>
            {empty ? <p className="py-10 text-center text-slate-500">暂无记录</p> : <Table>
              {section === 'credits' && <>
                <TableHeader><TableRow><TableHead>顺序号</TableHead><TableHead>时间（UTC）</TableHead><TableHead>类型</TableHead><TableHead>变动</TableHead><TableHead>变动后余额</TableHead></TableRow></TableHeader>
                <TableBody>{data.credits.map(row => <TableRow key={row.id}><TableCell>{row.id}</TableCell><TableCell>{statsTime(row.createdAt)}</TableCell><TableCell>{row.reason === 'opening_balance' ? '期初余额' : row.amount > 0 ? '积分增加' : '积分减少'}</TableCell><TableCell className={row.amount > 0 ? 'text-emerald-700' : 'text-rose-700'}>{row.reason === 'opening_balance' ? '—' : `${row.amount > 0 ? '+' : ''}${row.amount}`}</TableCell><TableCell>{row.balanceAfter}</TableCell></TableRow>)}</TableBody>
              </>}
              {section === 'generations' && <>
                <TableHeader><TableRow><TableHead>时间（UTC）</TableHead><TableHead>卡片 ID</TableHead><TableHead>类型</TableHead><TableHead>模型</TableHead><TableHead>状态</TableHead><TableHead>结果</TableHead></TableRow></TableHeader>
                <TableBody>{data.generations.map(row => <TableRow key={row.id}><TableCell className="whitespace-nowrap">{statsTime(row.timestamp)}</TableCell><TableCell className="max-w-48 break-all">{row.cardId}</TableCell><TableCell>{row.cardType}</TableCell><TableCell>{row.promptVersion}</TableCell><TableCell>{row.isError ? 'failed' : row.status}</TableCell><TableCell>{row.r2Url ? <a href={row.r2Url} target="_blank" rel="noreferrer" className="text-blue-600 underline">查看作品</a> : '—'}{row.errorMessage && <p className="max-w-sm break-words text-xs text-rose-600">{row.errorMessage}</p>}</TableCell></TableRow>)}</TableBody>
              </>}
              {section === 'purchases' && <>
                <TableHeader><TableRow><TableHead>时间（UTC）</TableHead><TableHead>套餐</TableHead><TableHead>金额</TableHead><TableHead>发放张数</TableHead><TableHead>状态</TableHead><TableHead>环境</TableHead></TableRow></TableHeader>
                <TableBody>{data.purchases.map(row => <TableRow key={row.id}><TableCell>{statsTime(row.createdAt)}</TableCell><TableCell>{purchaseLabel(row.sku)}</TableCell><TableCell>{statsMoney(row.amountCents, row.currency)}</TableCell><TableCell>{row.cardsGranted}</TableCell><TableCell>{row.status === 'completed' ? '已完成' : row.status === 'refunded' ? '已退款' : row.status}</TableCell><TableCell>{row.stripeLivemode === true ? 'Live' : row.stripeLivemode === false ? 'Test' : '未知'}</TableCell></TableRow>)}</TableBody>
              </>}
              {section === 'usage' && <>
                <TableHeader><TableRow><TableHead>日期（UTC）</TableHead><TableHead>每日额度已用张数</TableHead><TableHead>广告奖励张数</TableHead><TableHead>旧口径积分用量</TableHead></TableRow></TableHeader>
                <TableBody>{data.usage.map(row => <TableRow key={row.id}><TableCell>{row.date.slice(0, 10)}</TableCell><TableCell>{row.cards}</TableCell><TableCell>{row.adCards}</TableCell><TableCell>{row.count}</TableCell></TableRow>)}</TableBody>
              </>}
            </Table>}
          </>}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>上一页</Button>
            <span className="text-sm">第 {page} 页</span>
            <Button variant="outline" disabled={loading || !!error || !data?.hasMore} onClick={() => setPage(value => value + 1)}>下一页</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
