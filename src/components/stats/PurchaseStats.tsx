'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SKUS, type SkuKey } from '@/lib/pricing/plans';
import type { PurchaseStatsResponse } from '@/lib/stats-purchases';

export const purchaseLabel = (sku: string) => SKUS[sku as SkuKey]?.label || sku;
export const statsMoney = (cents: number, currency: string) => new Intl.NumberFormat('zh-CN', {
  style: 'currency', currency: currency.toUpperCase(),
}).format(cents / 100);
export const statsTime = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'UTC', hour12: false });

export function PurchaseStats({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PurchaseStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ startDate, endDate, page: String(page) });
    fetch(`/api/user-stats/purchases?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('一次性购买统计加载失败');
        const body = await response.json();
        if (!controller.signal.aborted) setData(body);
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [startDate, endDate, page, retry]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>一次性购买套餐</CardTitle>
        <p className="text-sm text-slate-500">{startDate} 至 {endDate}（UTC）。仅统计 live 订单；金额按币种分开，不计入 MRR / ARR。退款订单不计入有效订单金额。</p>
      </CardHeader>
      <CardContent className="space-y-6" aria-busy={loading}>
        {error && <p role="alert" className="text-rose-600">{error} <Button variant="outline" onClick={() => setRetry(value => value + 1)}>重试</Button></p>}
        {loading && <p role="status" className="text-sm text-slate-500">正在加载…</p>}
        {data && !loading && !error && <>
          <Table>
            <TableHeader><TableRow><TableHead>套餐</TableHead><TableHead>有效订单</TableHead><TableHead>购买人数</TableHead><TableHead>有效订单金额</TableHead><TableHead>发放卡数</TableHead><TableHead>退款订单</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.summary.map(row => <TableRow key={`${row.sku}-${row.currency}`}>
                <TableCell>{purchaseLabel(row.sku)}</TableCell><TableCell>{row.orders}</TableCell><TableCell>{row.buyers}</TableCell><TableCell>{statsMoney(row.revenueCents, row.currency)}</TableCell><TableCell>{row.cardsGranted}</TableCell><TableCell>{row.refundedOrders}</TableCell>
              </TableRow>)}
              {data.summary.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500">所选日期范围内暂无一次性购买</TableCell></TableRow>}
            </TableBody>
          </Table>
          <div>
            <h3 className="mb-3 font-semibold">购买用户（含退款订单）</h3>
            <Table>
              <TableHeader><TableRow><TableHead>用户</TableHead><TableHead>套餐</TableHead><TableHead>订单数</TableHead><TableHead>当前卡包余额</TableHead><TableHead>最近购买（UTC）</TableHead><TableHead>详情</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.users.map(user => <TableRow key={user.id}>
                  <TableCell><p>{user.name || '未命名用户'}</p><p className="text-xs text-slate-500">{user.email || user.id}</p></TableCell>
                  <TableCell>{user.skus.map(purchaseLabel).join('、')}</TableCell><TableCell>{user.orders}</TableCell><TableCell>{user.packCredits}</TableCell><TableCell>{statsTime(user.lastPurchaseAt)}</TableCell>
                  <TableCell><Link className="text-blue-600 underline" href={`/stats/users/${encodeURIComponent(user.id)}/`}>积分与生成记录</Link></TableCell>
                </TableRow>)}
                {data.users.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-500">暂无购买用户</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </>}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>上一页</Button>
          <span className="text-sm">第 {page} 页</span>
          <Button variant="outline" disabled={loading || !!error || !data?.hasMore} onClick={() => setPage(value => value + 1)}>下一页</Button>
        </div>
      </CardContent>
    </Card>
  );
}
