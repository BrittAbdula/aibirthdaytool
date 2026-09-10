'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PurchaseStats } from '@/components/stats/PurchaseStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MetricComparison {
  value: number | null;
  previous: number | null;
  changePct: number | null;
}

interface BusinessTrendRow {
  dt: string;
  new_users: number;
  active_creators: number;
  total_generations: number;
  completed_generations: number;
  failed_generations: number;
}

interface SubscriptionTrendRow {
  dt: string;
  new_subscriptions: number;
  ended_subscriptions: number;
  net_growth: number;
  gross_revenue_cents: number;
}

interface ModelHealthStat {
  promptVersion: string;
  total_calls: number;
  completion_rate: number;
  failure_rate: number;
  stale_non_terminal_calls: number;
  avg_duration_sec: number;
  unique_users: number;
  save_rate: number;
  send_rate: number;
  download_cards: number;
  copy_cards: number;
  up_cards: number;
  satisfaction_proxy: number;
}

interface CardTypeConversionStat {
  cardType: string;
  topModel: string;
  total_calls: number;
  completion_rate: number;
  failure_rate: number;
  save_rate: number;
  send_rate: number;
  download_rate: number;
  copy_rate: number;
  up_rate: number;
  satisfaction_proxy: number;
}

interface UserCallVolumeStat {
  dt: string;
  total_users: number;
  total_calls: number;
  up2_users: number;
  up5_users: number;
  up8_users: number;
  avg_calls: string;
}

interface MonetizationSourceStat {
  event_type: string;
  plan: string;
  source: string;
  count: number;
  users: number;
  stripe_sessions: number;
}

interface StatsResponse {
  meta: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
    timezone: 'UTC';
    generatedAt: string;
    subscriptionLifecycleReliableFrom: string;
    subscriptionLifecyclePartial: boolean;
  };
  overview: {
    newUsers: MetricComparison;
    activeCreators: MetricComparison;
    totalGenerations: MetricComparison;
    successRate: MetricComparison;
    failedGenerations: MetricComparison;
    grossRevenueCents: MetricComparison;
    staleGenerations: number;
  };
  businessTrend: BusinessTrendRow[];
  subscriptions: {
    current: {
      liveSubscribers: number;
      monthlySubscribers: number;
      yearlySubscribers: number;
      scheduledToCancel: number;
      unmappedPremiumEntitlements: number;
      mrrCents: number;
      arrCents: number;
      grossRevenueCents: number;
      currency: string;
    };
    trend: SubscriptionTrendRow[];
    statusMix: Array<{ status: string; count: number }>;
    planMix: Array<{ billing_period: string; unit_amount: number; currency: string; count: number }>;
    funnel: {
      upgradeIntent: number;
      ctaUsers: number;
      checkoutUsers: number;
      activatedUsers: number;
      intentToCtaRate: number | null;
      ctaToCheckoutRate: number | null;
      checkoutToActivationRate: number | null;
      intentToActivationRate: number | null;
    };
  };
  userActionStats: Array<{ dt: string; action: string; count: number }>;
  userCallVolumeStats: UserCallVolumeStat[];
  modelHealthStats: ModelHealthStat[];
  cardTypeConversionStats: CardTypeConversionStat[];
  monetizationSourceStats: MonetizationSourceStat[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];
const STATUS_LABELS: Record<string, string> = {
  active: '有效',
  trialing: '试用中',
  past_due: '逾期',
  canceled: '已取消',
  incomplete: '未完成',
  incomplete_expired: '未完成并过期',
  unpaid: '未付款',
  paused: '已暂停',
};

const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value);
const formatPercent = (value: number | null) => value === null ? '—' : `${value.toFixed(1)}%`;
const formatMoney = (cents: number, currency = 'usd') => new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: currency.toUpperCase(),
  minimumFractionDigits: 2,
}).format(cents / 100);
const compactLabel = (value: string, max = 18) => value.length > max ? `${value.slice(0, max - 1)}…` : value;

function MetricCard({
  title,
  value,
  comparison,
  note,
}: {
  title: string;
  value: string;
  comparison?: MetricComparison;
  note?: string;
}) {
  const delta = comparison?.changePct;
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <div className="mt-2 min-h-5 text-xs text-slate-500">
          {note ? note : delta === null || delta === undefined ? (
            <span>暂无可比基线</span>
          ) : (
            <span className={delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : ''}>
              较前期 {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label = '所选日期范围内暂无数据' }: { label?: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-slate-400">{label}</div>;
}

function LoadingDashboard() {
  return (
    <div className="mx-auto min-h-screen max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[420px] rounded-xl" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    </div>
  );
}

function pivotActions(rows: StatsResponse['userActionStats']) {
  const grouped: Record<string, Record<string, string | number>> = {};
  const actions = new Set<string>();
  for (const row of rows) {
    grouped[row.dt] ??= { dt: row.dt };
    grouped[row.dt][row.action || 'unknown'] = row.count;
    actions.add(row.action || 'unknown');
  }
  return {
    rows: Object.values(grouped).sort((a, b) => String(a.dt).localeCompare(String(b.dt))),
    actions: [...actions],
  };
}

export default function StatsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const fetchStats = useCallback(async (background = false) => {
    if (!date?.from || !date?.to) return;
    background ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
      });
      const response = await fetch(`/api/user-stats?${params}`, { cache: 'no-store' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (response.status === 401) throw new Error('Sign in required');
        if (response.status === 403) throw new Error('Admin access required');
        throw new Error(body?.error || '统计数据加载失败');
      }
      setData(await response.json());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '统计数据加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setLoading(false);
      setError('Sign in required');
      return;
    }
    fetchStats();
  }, [fetchStats, status]);

  const actionChart = useMemo(() => pivotActions(data?.userActionStats || []), [data?.userActionStats]);
  const modelRows = useMemo(
    () => [...(data?.modelHealthStats || [])].sort((a, b) => b.total_calls - a.total_calls).slice(0, 12),
    [data?.modelHealthStats]
  );
  const cardTypeRows = useMemo(
    () => [...(data?.cardTypeConversionStats || [])].sort((a, b) => b.total_calls - a.total_calls).slice(0, 12),
    [data?.cardTypeConversionStats]
  );
  const funnelData = data ? [
    { name: '升级意向', users: data.subscriptions.funnel.upgradeIntent },
    { name: '点击购买', users: data.subscriptions.funnel.ctaUsers },
    { name: '创建结账', users: data.subscriptions.funnel.checkoutUsers },
    { name: '订阅激活', users: data.subscriptions.funnel.activatedUsers },
  ] : [];

  const setPreset = (days: number) => {
    const to = new Date();
    setDate({ from: addDays(to, -(days - 1)), to });
  };

  if (loading) return <LoadingDashboard />;

  if (error || !data) {
    const needsSignIn = error === 'Sign in required';
    const needsAdmin = error === 'Admin access required';
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader><CardTitle>{needsSignIn ? '登录后查看统计' : needsAdmin ? '需要管理员权限' : '统计暂不可用'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">{needsSignIn ? '经营看板仅对管理员账户开放。' : needsAdmin ? '当前账户没有访问内部经营看板的权限。' : error}</p>
            {needsSignIn && <Button onClick={() => signIn('google')}>使用 Google 登录</Button>}
            {!needsSignIn && !needsAdmin && <Button variant="outline" onClick={() => fetchStats()}>重试</Button>}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, subscriptions, meta } = data;
  const statusTotal = subscriptions.statusMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge className="mb-3 bg-white/10 text-blue-100 hover:bg-white/10">管理员 · UTC</Badge>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">经营数据中心</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">统一查看增长、产品使用、生成质量与 Stripe live 订阅表现。</p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-white/5 p-3 sm:flex-row sm:items-center">
              <div className="flex gap-1">
                {[7, 30, 90].map(days => (
                  <Button key={days} size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setPreset(days)}>{days} 天</Button>
                ))}
              </div>
              <div className="rounded-md bg-white text-slate-900"><DatePickerWithRange date={date} setDate={setDate} /></div>
              <Button size="icon" variant="secondary" onClick={() => fetchStats(true)} disabled={refreshing} aria-label="刷新统计">
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">数据生成于 {new Date(meta.generatedAt).toLocaleString('zh-CN', { timeZone: 'UTC' })} UTC</p>
        </header>

        {subscriptions.current.unmappedPremiumEntitlements > 0 && (
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div><strong>数据质量提示：</strong>有 {subscriptions.current.unmappedPremiumEntitlements} 个 PREMIUM 权益未映射到正式 live Price，已从订阅数、MRR 和 ARR 中排除。</div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-white p-1 shadow-sm sm:grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="subscriptions">订阅与收入</TabsTrigger>
            <TabsTrigger value="product">产品使用</TabsTrigger>
            <TabsTrigger value="models">模型质量</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard title="新增用户" value={formatNumber(overview.newUsers.value || 0)} comparison={overview.newUsers} />
              <MetricCard title="活跃创作者" value={formatNumber(overview.activeCreators.value || 0)} comparison={overview.activeCreators} />
              <MetricCard title="生成请求" value={formatNumber(overview.totalGenerations.value || 0)} comparison={overview.totalGenerations} />
              <MetricCard title="生成成功率" value={formatPercent(overview.successRate.value)} comparison={overview.successRate} />
              <MetricCard title="选定期订阅回款" value={formatMoney(overview.grossRevenueCents.value || 0)} comparison={overview.grossRevenueCents} />
              <MetricCard title="Live 订阅" value={formatNumber(subscriptions.current.liveSubscribers)} note="当前快照" />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>增长与生成趋势</CardTitle></CardHeader>
                <CardContent className="h-[360px]">
                  {data.businessTrend.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.businessTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dt" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="users" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="generations" orientation="right" tick={{ fontSize: 11 }} />
                        <Tooltip /><Legend />
                        <Bar yAxisId="generations" dataKey="total_generations" name="生成请求" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="users" dataKey="active_creators" name="活跃创作者" stroke="#2563eb" strokeWidth={2} dot={false} />
                        <Line yAxisId="users" dataKey="new_users" name="新增用户" stroke="#16a34a" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>订阅与回款趋势</CardTitle>
                  {meta.subscriptionLifecyclePartial && <p className="text-sm text-amber-700">取消趋势自 2026-07-16 起完整；更早数据仅可靠展示成功回款。</p>}
                </CardHeader>
                <CardContent className="h-[360px]">
                  {subscriptions.trend.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={subscriptions.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dt" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="subscriptions" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="revenue" orientation="right" tickFormatter={value => `$${(Number(value) / 100).toFixed(0)}`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value, name) => name === '回款' ? formatMoney(Number(value)) : formatNumber(Number(value))} />
                        <Legend />
                        <Bar yAxisId="revenue" dataKey="gross_revenue_cents" name="回款" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="subscriptions" dataKey="new_subscriptions" name="新增订阅" stroke="#16a34a" strokeWidth={2} />
                        <Line yAxisId="subscriptions" dataKey="ended_subscriptions" name="结束订阅" stroke="#dc2626" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </section>

            {(overview.staleGenerations > 0 || (overview.failedGenerations.value || 0) > 0) && (
              <Card className="border-amber-200 bg-amber-50/70">
                <CardContent className="flex flex-wrap gap-6 p-5 text-sm">
                  <span><strong>{formatNumber(overview.failedGenerations.value || 0)}</strong> 个失败生成</span>
                  <span><strong>{formatNumber(overview.staleGenerations)}</strong> 个超过 24 小时未终结任务</span>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <PurchaseStats key={`${meta.startDate}-${meta.endDate}-${meta.generatedAt}`} startDate={meta.startDate} endDate={meta.endDate} />
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <MetricCard title="Live 订阅" value={formatNumber(subscriptions.current.liveSubscribers)} note="active + trialing" />
              <MetricCard title="MRR" value={formatMoney(subscriptions.current.mrrCents, subscriptions.current.currency)} note="当前月度经常性收入" />
              <MetricCard title="ARR" value={formatMoney(subscriptions.current.arrCents, subscriptions.current.currency)} note="当前年化收入" />
              <MetricCard title="月付 / 年付" value={`${subscriptions.current.monthlySubscribers} / ${subscriptions.current.yearlySubscribers}`} note="当前套餐组合" />
              <MetricCard title="待取消" value={formatNumber(subscriptions.current.scheduledToCancel)} note="期末停止续费" />
              <MetricCard title="选定期订阅回款" value={formatMoney(subscriptions.current.grossRevenueCents, subscriptions.current.currency)} note={`${meta.startDate} 至 ${meta.endDate}`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader><CardTitle>已识别 live 订阅状态</CardTitle></CardHeader>
                <CardContent className="h-[340px]">
                  {statusTotal === 0 ? <EmptyChart label="暂无已识别的 live 订阅" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={subscriptions.statusMix} dataKey="count" nameKey="status" innerRadius={65} outerRadius={105} paddingAngle={3} label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}>
                          {subscriptions.statusMix.map((item, index) => <Cell key={item.status} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>购买漏斗（唯一用户）</CardTitle>
                  <p className="text-sm text-slate-500">重复打开或点击不会重复计数。</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={72} />
                        <Tooltip formatter={(value) => formatNumber(Number(value))} />
                        <Bar dataKey="users" name="用户" fill="#2563eb" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div><p className="text-slate-500">意向→点击</p><strong>{formatPercent(subscriptions.funnel.intentToCtaRate)}</strong></div>
                    <div><p className="text-slate-500">点击→结账</p><strong>{formatPercent(subscriptions.funnel.ctaToCheckoutRate)}</strong></div>
                    <div><p className="text-slate-500">结账→激活</p><strong>{formatPercent(subscriptions.funnel.checkoutToActivationRate)}</strong></div>
                    <div><p className="text-slate-500">整体转化</p><strong>{formatPercent(subscriptions.funnel.intentToActivationRate)}</strong></div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader><CardTitle>变现来源明细</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>事件</TableHead><TableHead>来源</TableHead><TableHead>套餐</TableHead><TableHead className="text-right">事件数</TableHead><TableHead className="text-right">用户数</TableHead><TableHead className="text-right">Stripe Session</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.monetizationSourceStats.slice(0, 30).map(row => (
                      <TableRow key={`${row.event_type}-${row.source}-${row.plan}`}><TableCell className="font-medium">{row.event_type}</TableCell><TableCell className="max-w-[280px] truncate" title={row.source}>{row.source}</TableCell><TableCell>{row.plan}</TableCell><TableCell className="text-right">{formatNumber(row.count)}</TableCell><TableCell className="text-right">{formatNumber(row.users)}</TableCell><TableCell className="text-right">{formatNumber(row.stripe_sessions)}</TableCell></TableRow>
                    ))}
                    {data.monetizationSourceStats.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-400">所选日期范围内暂无变现事件</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product" className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>用户行为趋势</CardTitle></CardHeader>
                <CardContent className="h-[340px]">
                  {actionChart.rows.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%"><BarChart data={actionChart.rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dt" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />{actionChart.actions.map((action, index) => <Bar key={action} dataKey={action} stackId="actions" fill={COLORS[index % COLORS.length]} />)}</BarChart></ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>活跃深度</CardTitle></CardHeader>
                <CardContent className="h-[340px]">
                  {data.userCallVolumeStats.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data.userCallVolumeStats}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dt" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend /><Area dataKey="total_users" name="生成用户" fill="#dbeafe" stroke="#2563eb" /><Line dataKey="up2_users" name=">2 次" stroke="#16a34a" dot={false} /><Line dataKey="up5_users" name=">5 次" stroke="#f59e0b" dot={false} /><Line dataKey="up8_users" name=">8 次" stroke="#dc2626" dot={false} /></ComposedChart></ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader><CardTitle>卡片类型表现</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%"><BarChart data={cardTypeRows.slice(0, 8)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="cardType" tick={{ fontSize: 11 }} /><YAxis /><Tooltip formatter={(value) => formatPercent(Number(value))} /><Legend /><Bar dataKey="save_rate" name="保存率" fill="#2563eb" /><Bar dataKey="send_rate" name="发送率" fill="#16a34a" /><Bar dataKey="failure_rate" name="失败率" fill="#dc2626" /></BarChart></ResponsiveContainer>
                </div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>卡片类型</TableHead><TableHead>主要模型</TableHead><TableHead className="text-right">请求</TableHead><TableHead className="text-right">成功率</TableHead><TableHead className="text-right">保存率</TableHead><TableHead className="text-right">发送率</TableHead><TableHead className="text-right">下载率</TableHead><TableHead className="text-right">满意度代理</TableHead></TableRow></TableHeader><TableBody>{cardTypeRows.map(row => <TableRow key={row.cardType}><TableCell className="font-medium">{row.cardType}</TableCell><TableCell className="max-w-[220px] truncate" title={row.topModel}>{row.topModel}</TableCell><TableCell className="text-right">{formatNumber(row.total_calls)}</TableCell><TableCell className="text-right">{formatPercent(row.completion_rate)}</TableCell><TableCell className="text-right">{formatPercent(row.save_rate)}</TableCell><TableCell className="text-right">{formatPercent(row.send_rate)}</TableCell><TableCell className="text-right">{formatPercent(row.download_rate)}</TableCell><TableCell className="text-right">{row.satisfaction_proxy.toFixed(1)}</TableCell></TableRow>)}</TableBody></Table></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>每日生成明细</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table><TableHeader><TableRow><TableHead>日期</TableHead><TableHead className="text-right">用户</TableHead><TableHead className="text-right">调用</TableHead><TableHead className="text-right">&gt;2 次</TableHead><TableHead className="text-right">&gt;5 次</TableHead><TableHead className="text-right">&gt;8 次</TableHead><TableHead className="text-right">人均调用</TableHead></TableRow></TableHeader><TableBody>{[...data.userCallVolumeStats].reverse().map(row => <TableRow key={row.dt}><TableCell className="cursor-pointer font-medium text-blue-700 hover:underline" onClick={() => router.push(`/stats/daily/${row.dt}`)}>{row.dt}</TableCell><TableCell className="text-right">{formatNumber(row.total_users)}</TableCell><TableCell className="text-right">{formatNumber(row.total_calls)}</TableCell><TableCell className="text-right">{formatNumber(row.up2_users)}</TableCell><TableCell className="text-right">{formatNumber(row.up5_users)}</TableCell><TableCell className="text-right">{formatNumber(row.up8_users)}</TableCell><TableCell className="text-right">{row.avg_calls}</TableCell></TableRow>)}</TableBody></Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>模型健康与行为信号</CardTitle><p className="text-sm text-slate-500">成功/失败率用于可靠性判断；保存和发送率用于观察下游价值。</p></CardHeader>
              <CardContent className="space-y-5">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%"><BarChart data={modelRows.slice(0, 8)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="promptVersion" tickFormatter={value => compactLabel(String(value), 13)} tick={{ fontSize: 11 }} /><YAxis /><Tooltip labelFormatter={value => String(value)} formatter={(value) => formatPercent(Number(value))} /><Legend /><Bar dataKey="completion_rate" name="完成率" fill="#2563eb" /><Bar dataKey="failure_rate" name="失败率" fill="#dc2626" /><Bar dataKey="save_rate" name="保存率" fill="#16a34a" /></BarChart></ResponsiveContainer>
                </div>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>模型</TableHead><TableHead className="text-right">请求</TableHead><TableHead className="text-right">完成率</TableHead><TableHead className="text-right">失败率</TableHead><TableHead className="text-right">卡住</TableHead><TableHead className="text-right">平均耗时</TableHead><TableHead className="text-right">用户</TableHead><TableHead className="text-right">保存率</TableHead><TableHead className="text-right">发送率</TableHead><TableHead className="text-right">D/C/U</TableHead><TableHead className="text-right">代理分</TableHead></TableRow></TableHeader><TableBody>{modelRows.map(row => <TableRow key={row.promptVersion}><TableCell className="max-w-[260px] truncate font-medium" title={row.promptVersion}>{row.promptVersion}</TableCell><TableCell className="text-right">{formatNumber(row.total_calls)}</TableCell><TableCell className="text-right">{formatPercent(row.completion_rate)}</TableCell><TableCell className="text-right">{formatPercent(row.failure_rate)}</TableCell><TableCell className="text-right">{formatNumber(row.stale_non_terminal_calls)}</TableCell><TableCell className="text-right">{row.avg_duration_sec.toFixed(2)}s</TableCell><TableCell className="text-right">{formatNumber(row.unique_users)}</TableCell><TableCell className="text-right">{formatPercent(row.save_rate)}</TableCell><TableCell className="text-right">{formatPercent(row.send_rate)}</TableCell><TableCell className="text-right">{row.download_cards}/{row.copy_cards}/{row.up_cards}</TableCell><TableCell className="text-right">{row.satisfaction_proxy.toFixed(1)}</TableCell></TableRow>)}</TableBody></Table></div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5" />生成成功率只使用已终结任务作为分母，pending/processing 单独作为卡住任务监控。</div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
