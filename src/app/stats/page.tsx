'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

interface UserActionStat {
  dt: string;
  action: string;
  count: number;
}

interface ApiStatByVersion {
  dt: string;
  promptVersion: string | null;
  count: number;
}

interface ApiFailureStatByVersion {
  dt: string;
  promptVersion: string | null;
  count: number;
}

interface ApiCallStatByType {
  dt: string;
  cardType: string | null;
  total_count: number;
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

interface ModelHealthStat {
  promptVersion: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  pending_calls: number;
  processing_calls: number;
  stale_non_terminal_calls: number;
  avg_duration_sec: number;
  tokens_used: number;
  unique_users: number;
  modification_calls: number;
  reference_image_calls: number;
  saved_cards: number;
  public_cards: number;
  copy_cards: number;
  download_cards: number;
  send_cards: number;
  up_cards: number;
  moment_answer_cards: number;
  completion_rate: number;
  failure_rate: number;
  save_rate: number;
  send_rate: number;
  satisfaction_proxy: number;
}

interface CardTypeConversionStat {
  cardType: string;
  topModel: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  unique_users: number;
  avg_duration_sec: number;
  saved_cards: number;
  public_cards: number;
  copy_cards: number;
  download_cards: number;
  send_cards: number;
  up_cards: number;
  moment_answer_cards: number;
  completion_rate: number;
  failure_rate: number;
  save_rate: number;
  send_rate: number;
  download_rate: number;
  copy_rate: number;
  up_rate: number;
  satisfaction_proxy: number;
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
const formatSeconds = (value: number) => `${value.toFixed(2)}s`;
const compactLabel = (value: string, maxLength = 22) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

export default function StatsPage() {
  const router = useRouter();
  const { status } = useSession();

  const [userActionStats, setUserActionStats] = useState<UserActionStat[]>([]);
  const [apiStatsByVersion, setApiStatsByVersion] = useState<ApiStatByVersion[]>([]);
  const [apiFailureStatsByVersion, setApiFailureStatsByVersion] = useState<ApiFailureStatByVersion[]>([]);
  const [apiCallStatsByType, setApiCallStatsByType] = useState<ApiCallStatByType[]>([]);
  const [userCallVolumeStats, setUserCallVolumeStats] = useState<UserCallVolumeStat[]>([]);
  const [modelHealthStats, setModelHealthStats] = useState<ModelHealthStat[]>([]);
  const [cardTypeConversionStats, setCardTypeConversionStats] = useState<CardTypeConversionStat[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const [processedUserActionChartData, setProcessedUserActionChartData] = useState<any[]>([]);
  const [processedApiErrorChartData, setProcessedApiErrorChartData] = useState<any[]>([]);
  const [processedApiFailureChartData, setProcessedApiFailureChartData] = useState<any[]>([]);
  const [processedApiCallChartData, setProcessedApiCallChartData] = useState<any[]>([]);
  const [processedUserCallVolumeStats, setProcessedUserCallVolumeStats] = useState<UserCallVolumeStat[]>([]); 
  const [topPromptVersions, setTopPromptVersions] = useState<string[]>([]);
  const [topFailurePromptVersions, setTopFailurePromptVersions] = useState<string[]>([]);
  const [topCardTypes, setTopCardTypes] = useState<string[]>([]);

  const fetchStats = useCallback(async () => {
    if (!date?.from || !date?.to) return;

    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: date.from.toISOString().split('T')[0],
        endDate: date.to.toISOString().split('T')[0]
      });

      const response = await fetch(`/api/user-stats?${params.toString()}`);
      if (!response.ok) {
        let message = 'Failed to fetch stats';

        try {
          const errorBody = await response.json();
          if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
            message = errorBody.error;
          }
        } catch {
          // Ignore JSON parsing failures and keep the fallback message.
        }

        if (response.status === 401) {
          throw new Error('Sign in required');
        }

        if (response.status === 403) {
          throw new Error('Admin access required');
        }

        throw new Error(message);
      }
      
      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected an object');
      }

      setUserActionStats(Array.isArray(data.userActionStats) ? data.userActionStats : []);
      setApiStatsByVersion(Array.isArray(data.apiStatsByVersion) ? data.apiStatsByVersion : []);
      setApiFailureStatsByVersion(Array.isArray(data.apiFailureStatsByVersion) ? data.apiFailureStatsByVersion : []);
      setApiCallStatsByType(Array.isArray(data.apiCallStatsByType) ? data.apiCallStatsByType : []);
      setModelHealthStats(Array.isArray(data.modelHealthStats) ? data.modelHealthStats : []);
      setCardTypeConversionStats(Array.isArray(data.cardTypeConversionStats) ? data.cardTypeConversionStats : []);
      
      const sortedStats = Array.isArray(data.userCallVolumeStats) 
        ? [...data.userCallVolumeStats].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime())
        : [];
      setUserCallVolumeStats(sortedStats);

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      setUserActionStats([]);
      setApiStatsByVersion([]);
      setApiFailureStatsByVersion([]);
      setApiCallStatsByType([]);
      setUserCallVolumeStats([]);
      setModelHealthStats([]);
      setCardTypeConversionStats([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      setLoading(false);
      setError('Sign in required');
      setUserActionStats([]);
      setApiStatsByVersion([]);
      setApiFailureStatsByVersion([]);
      setApiCallStatsByType([]);
      setUserCallVolumeStats([]);
      setModelHealthStats([]);
      setCardTypeConversionStats([]);
      return;
    }

    fetchStats();
  }, [fetchStats, status]);

  // 处理数据用于图表展示
  useEffect(() => {
    try {
      // 用户行为按日期分组
      const userActionGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const userActions = new Set<string>();

      userActionStats.forEach(stat => {
        if (!userActionGroupedByDate[stat.dt]) {
          userActionGroupedByDate[stat.dt] = { dt: stat.dt };
        }
        userActionGroupedByDate[stat.dt][stat.action || 'unknown'] = stat.count;
        userActions.add(stat.action || 'unknown');
      });

      const processedData = Object.values(userActionGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedUserActionChartData(processedData);

      // API调用统计按版本分组，每个日期保留前5个
      const apiErrorGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const versionCountsByDate: Record<string, { version: string; count: number }[]> = {};
      const allTopVersions = new Set<string>();

      // 第一步：按日期分组并记录计数
      apiStatsByVersion.forEach(stat => {
        const version = stat.promptVersion || 'unknown';
        const date = stat.dt;
        
        if (!versionCountsByDate[date]) {
          versionCountsByDate[date] = [];
        }
        
        versionCountsByDate[date].push({ 
          version, 
          count: stat.count 
        });
      });
      
      // 第二步：对每个日期的版本按计数排序，并只保留前5个
      Object.keys(versionCountsByDate).forEach(date => {
        versionCountsByDate[date].sort((a, b) => b.count - a.count);
        
        const topFive = versionCountsByDate[date].slice(0, 5);
        apiErrorGroupedByDate[date] = { dt: date };
        
        topFive.forEach(item => {
          apiErrorGroupedByDate[date][item.version] = item.count;
          allTopVersions.add(item.version);
        });
      });
      
      const processedErrorData = Object.values(apiErrorGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedApiErrorChartData(processedErrorData);
      setTopPromptVersions(Array.from(allTopVersions));

      // 处理API失败调用统计（按Prompt Version）- 使用新的API数据
      const apiFailureGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const versionFailureCountsByDate: Record<string, { version: string; count: number }[]> = {};
      const failureVersions = new Set<string>();

      // 按日期和版本分组统计失败调用
      apiFailureStatsByVersion.forEach(stat => {
        const version = stat.promptVersion || 'unknown';
        const date = stat.dt;
        
        if (!versionFailureCountsByDate[date]) {
          versionFailureCountsByDate[date] = [];
        }
        
        versionFailureCountsByDate[date].push({ 
          version, 
          count: stat.count 
        });
      });
      
      // 对每个日期的版本按计数排序，并只保留前5个
      Object.keys(versionFailureCountsByDate).forEach(date => {
        versionFailureCountsByDate[date].sort((a, b) => b.count - a.count);
        
        const topFive = versionFailureCountsByDate[date].slice(0, 5);
        apiFailureGroupedByDate[date] = { dt: date };
        
        topFive.forEach(item => {
          apiFailureGroupedByDate[date][item.version] = item.count;
          failureVersions.add(item.version);
        });
      });
      
      const processedFailureData = Object.values(apiFailureGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedApiFailureChartData(processedFailureData);
      setTopFailurePromptVersions(Array.from(failureVersions));

      // API调用按卡片类型分组，每个日期保留前5个
      const apiCallGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const typeCountsByDate: Record<string, { type: string; count: number }[]> = {};
      const allTopCardTypes = new Set<string>();

      // 第一步：按日期分组并记录计数
      apiCallStatsByType.forEach(stat => {
        const type = stat.cardType || 'unknown';
        const date = stat.dt;
        
        if (!typeCountsByDate[date]) {
          typeCountsByDate[date] = [];
        }
        
        typeCountsByDate[date].push({ 
          type, 
          count: stat.total_count 
        });
      });
      
      // 第二步：对每个日期的类型按计数排序，并只保留前5个
      Object.keys(typeCountsByDate).forEach(date => {
        typeCountsByDate[date].sort((a, b) => b.count - a.count);
        
        const topFive = typeCountsByDate[date].slice(0, 5);
        apiCallGroupedByDate[date] = { dt: date };
        
        topFive.forEach(item => {
          apiCallGroupedByDate[date][item.type] = item.count;
          allTopCardTypes.add(item.type);
        });
      });
      
      const processedCallData = Object.values(apiCallGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedApiCallChartData(processedCallData);
      setTopCardTypes(Array.from(allTopCardTypes));

      // 用户调用量统计可以直接使用
      setProcessedUserCallVolumeStats(userCallVolumeStats);
      
    } catch (err) {
      console.error("Error processing chart data:", err);
    }
  }, [userActionStats, apiStatsByVersion, apiFailureStatsByVersion, apiCallStatsByType, userCallVolumeStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    const needsSignIn = error === 'Sign in required';
    const needsAdmin = error === 'Admin access required';

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg border-orange-100 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {needsSignIn ? 'Sign in to view stats' : needsAdmin ? 'Admin access required' : 'Stats unavailable'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {needsSignIn
                ? 'This dashboard is only available to signed-in admin accounts.'
                : needsAdmin
                  ? 'Your current account is authenticated, but it does not have access to the internal stats dashboard.'
                  : error}
            </p>
            {needsSignIn ? (
              <Button onClick={() => signIn('google')}>Sign in</Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取唯一的行为、版本和卡片类型用于图表渲染
  const uniqueActions = processedUserActionChartData.length > 0 
    ? Object.keys(processedUserActionChartData[0]).filter(key => key !== 'dt') 
    : [];

  // 图表颜色
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#f7f3f7', '#cc3300', '#6699cc', '#996633'];
  const modelHealthRows = [...modelHealthStats]
    .sort((a, b) => b.total_calls - a.total_calls)
    .slice(0, 12);
  const modelHealthChartData = modelHealthRows.slice(0, 8).map(stat => ({
    model: stat.promptVersion,
    completion_rate: stat.completion_rate,
    failure_rate: stat.failure_rate,
    satisfaction_proxy: stat.satisfaction_proxy,
  }));
  const cardTypeRows = [...cardTypeConversionStats]
    .sort((a, b) => b.total_calls - a.total_calls)
    .slice(0, 12);
  const cardTypeChartData = cardTypeRows.slice(0, 8).map(stat => ({
    cardType: stat.cardType,
    save_rate: stat.save_rate,
    send_rate: stat.send_rate,
    satisfaction_proxy: stat.satisfaction_proxy,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Activity Statistics</h1>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {/* 图表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 图表1: 用户行为统计 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily User Actions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedUserActionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {uniqueActions.map((action, index) => (
                    <Bar key={action} dataKey={action} stackId="a" fill={colors[index % colors.length]} name={action} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 图表2: 失败API调用统计 (按Prompt Version) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Failed API Calls by Prompt Version (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedApiFailureChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {topFailurePromptVersions.map((version, index) => (
                    <Bar 
                      key={version} 
                      dataKey={version} 
                      stackId="failure" 
                      fill={colors[index % colors.length]} 
                      name={version === 'unknown' ? 'Unknown Version' : version} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 图表3: API调用统计 (Top 5 per date) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily API Calls by Prompt Version (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedApiErrorChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {topPromptVersions.map((version, index) => (
                    <Bar 
                      key={version} 
                      dataKey={version} 
                      stackId="b" 
                      fill={colors[index % colors.length]} 
                      name={version === 'unknown' ? 'Unknown Version' : version} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 图表4: 卡片类型API调用统计 (Top 5 per date) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily API Calls by Card Type (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedApiCallChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {topCardTypes.map((type, index) => (
                    <Bar 
                      key={type} 
                      dataKey={type} 
                      stackId="c" 
                      fill={colors[index % colors.length]} 
                      name={type === 'unknown' ? 'Unknown Type' : type} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 图表5: 用户调用量分层统计 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily User Call Volume by Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedUserCallVolumeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="total_users" stroke="#8884d8" name="Total Users" />
                  {/* <Line yAxisId="left" type="monotone" dataKey="total_calls" stroke="#82ca9d" name="Total Calls" /> */}
                  <Line yAxisId="left" type="monotone" dataKey="up2_users" stroke="#ffc658" name="Users > 2 Calls" />
                  <Line yAxisId="left" type="monotone" dataKey="up5_users" stroke="#ff7300" name="Users > 5 Calls" />
                  <Line yAxisId="left" type="monotone" dataKey="up8_users" stroke="#a4de6c" name="Users > 8 Calls" />
                  {/* <Line yAxisId="right" type="monotone" dataKey="avg_calls" stroke="#d0ed57" name="Avg Calls" /> */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Model-Level Health and Behavior Signals</CardTitle>
            <p className="text-sm text-muted-foreground">
              Completion/failure use all calls. Save, send, and proxy rates use completed calls as denominator.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelHealthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" tickFormatter={(value) => compactLabel(String(value), 14)} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => String(value)} formatter={(value, name) => {
                    const metric = String(name);
                    return [metric === 'satisfaction_proxy' ? Number(value).toFixed(1) : formatPercent(Number(value)), metric];
                  }} />
                  <Legend />
                  <Bar dataKey="completion_rate" fill="#2563eb" name="Completion %" />
                  <Bar dataKey="failure_rate" fill="#dc2626" name="Failure %" />
                  <Bar dataKey="satisfaction_proxy" fill="#16a34a" name="Satisfaction Proxy" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Stale</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Save</TableHead>
                    <TableHead className="text-right">Send</TableHead>
                    <TableHead className="text-right">D/C/U</TableHead>
                    <TableHead className="text-right">Proxy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelHealthRows.map((stat) => (
                    <TableRow key={stat.promptVersion}>
                      <TableCell className="max-w-[260px] truncate font-medium" title={stat.promptVersion}>
                        {stat.promptVersion}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(stat.total_calls)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.completion_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.failure_rate)}</TableCell>
                      <TableCell className="text-right">{formatNumber(stat.stale_non_terminal_calls)}</TableCell>
                      <TableCell className="text-right">{formatSeconds(stat.avg_duration_sec)}</TableCell>
                      <TableCell className="text-right">{formatNumber(stat.unique_users)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.save_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.send_rate)}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(stat.download_cards)}/{formatNumber(stat.copy_cards)}/{formatNumber(stat.up_cards)}
                      </TableCell>
                      <TableCell className="text-right">{stat.satisfaction_proxy.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card-Type Conversion and Satisfaction Proxy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Behavior counts are deduped by original card ID so repeated events do not inflate conversion.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cardType" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    const metric = String(name);
                    return [metric === 'satisfaction_proxy' ? Number(value).toFixed(1) : formatPercent(Number(value)), metric];
                  }} />
                  <Legend />
                  <Bar dataKey="save_rate" fill="#2563eb" name="Save %" />
                  <Bar dataKey="send_rate" fill="#16a34a" name="Send %" />
                  <Bar dataKey="satisfaction_proxy" fill="#f59e0b" name="Satisfaction Proxy" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Type</TableHead>
                    <TableHead>Top Model</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Save</TableHead>
                    <TableHead className="text-right">Send</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                    <TableHead className="text-right">Copy</TableHead>
                    <TableHead className="text-right">Up</TableHead>
                    <TableHead className="text-right">Proxy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cardTypeRows.map((stat) => (
                    <TableRow key={stat.cardType}>
                      <TableCell className="font-medium">{stat.cardType}</TableCell>
                      <TableCell className="max-w-[220px] truncate" title={stat.topModel}>
                        {stat.topModel}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(stat.total_calls)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.completion_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.failure_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.save_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.send_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.download_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.copy_rate)}</TableCell>
                      <TableCell className="text-right">{formatPercent(stat.up_rate)}</TableCell>
                      <TableCell className="text-right">{stat.satisfaction_proxy.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细表格 */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics (User Call Volume)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Users</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Users &gt; 2 Calls</TableHead>
                  <TableHead className="text-right">Users &gt; 5 Calls</TableHead>
                  <TableHead className="text-right">Users &gt; 8 Calls</TableHead>
                  <TableHead className="text-right">Avg Calls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...userCallVolumeStats]
                  .sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime())
                  .map((stat) => (
                    <TableRow key={stat.dt}>
                      <TableCell
                        className="cursor-pointer hover:text-primary hover:underline"
                        onClick={() => router.push(`/stats/daily/${stat.dt}`)}
                      >
                        {stat.dt}
                      </TableCell>
                      <TableCell className="text-right">{stat.total_users}</TableCell>
                      <TableCell className="text-right">{stat.total_calls}</TableCell>
                      <TableCell className="text-right">{stat.up2_users}</TableCell>
                      <TableCell className="text-right">{stat.up5_users}</TableCell>
                      <TableCell className="text-right">{stat.up8_users}</TableCell>
                      <TableCell className="text-right">{stat.avg_calls}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
