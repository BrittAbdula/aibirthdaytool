'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useRouter } from 'next/navigation';

interface UserActionStat {
  dt: string;
  action: string;
  count: number;
}

interface ApiErrorStatByVersion {
  dt: string;
  promptVersion: string | null;
  error_count: number;
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

export default function StatsPage() {
  const router = useRouter();

  const [userActionStats, setUserActionStats] = useState<UserActionStat[]>([]);
  const [apiErrorStatsByVersion, setApiErrorStatsByVersion] = useState<ApiErrorStatByVersion[]>([]);
  const [apiCallStatsByType, setApiCallStatsByType] = useState<ApiCallStatByType[]>([]);
  const [userCallVolumeStats, setUserCallVolumeStats] = useState<UserCallVolumeStat[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const [processedUserActionChartData, setProcessedUserActionChartData] = useState<any[]>([]);
  const [processedApiErrorChartData, setProcessedApiErrorChartData] = useState<any[]>([]);
  const [processedApiCallChartData, setProcessedApiCallChartData] = useState<any[]>([]);
  const [processedUserCallVolumeStats, setProcessedUserCallVolumeStats] = useState<UserCallVolumeStat[]>([]); 

  const fetchStats = async () => {
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
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      console.log("API Response Data:", data);

      // 验证接收到的数据结构
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected an object');
      }

      // 设置状态变量，确保处理空数组的情况
      setUserActionStats(Array.isArray(data.userActionStats) ? data.userActionStats : []);
      setApiErrorStatsByVersion(Array.isArray(data.apiErrorStatsByVersion) ? data.apiErrorStatsByVersion : []);
      setApiCallStatsByType(Array.isArray(data.apiCallStatsByType) ? data.apiCallStatsByType : []);
      
      // 排序用户调用量统计
      const sortedStats = Array.isArray(data.userCallVolumeStats) 
        ? [...data.userCallVolumeStats].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime())
        : [];
      setUserCallVolumeStats(sortedStats);

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      // 重置所有状态为空数组
      setUserActionStats([]);
      setApiErrorStatsByVersion([]);
      setApiCallStatsByType([]);
      setUserCallVolumeStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [date]);

  // 处理数据用于图表展示
  useEffect(() => {
    // 处理用户行为统计数据
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

      // API错误统计按版本分组
      const apiErrorGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const promptVersions = new Set<string>();

      apiErrorStatsByVersion.forEach(stat => {
        const version = stat.promptVersion || 'unknown';
        if (!apiErrorGroupedByDate[stat.dt]) {
          apiErrorGroupedByDate[stat.dt] = { dt: stat.dt };
        }
        apiErrorGroupedByDate[stat.dt][version] = stat.error_count;
        promptVersions.add(version);
      });

      const processedErrorData = Object.values(apiErrorGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedApiErrorChartData(processedErrorData);

      // API调用按卡片类型分组
      const apiCallGroupedByDate: Record<string, { dt: string; [key: string]: any }> = {};
      const cardTypes = new Set<string>();

      apiCallStatsByType.forEach(stat => {
        const type = stat.cardType || 'unknown';
        if (!apiCallGroupedByDate[stat.dt]) {
          apiCallGroupedByDate[stat.dt] = { dt: stat.dt };
        }
        apiCallGroupedByDate[stat.dt][type] = stat.total_count;
        cardTypes.add(type);
      });

      const processedCallData = Object.values(apiCallGroupedByDate).sort((a, b) => 
        new Date(a.dt).getTime() - new Date(b.dt).getTime()
      );
      setProcessedApiCallChartData(processedCallData);

      // 用户调用量统计可以直接使用
      setProcessedUserCallVolumeStats(userCallVolumeStats);
      
    } catch (err) {
      console.error("Error processing chart data:", err);
    }
  }, [userActionStats, apiErrorStatsByVersion, apiCallStatsByType, userCallVolumeStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  // 获取唯一的行为、版本和卡片类型用于图表渲染
  const uniqueActions = processedUserActionChartData.length > 0 
    ? Object.keys(processedUserActionChartData[0]).filter(key => key !== 'dt') 
    : [];
  
  const uniquePromptVersions = processedApiErrorChartData.length > 0 
    ? Object.keys(processedApiErrorChartData[0]).filter(key => key !== 'dt') 
    : [];
  
  const uniqueCardTypes = processedApiCallChartData.length > 0 
    ? Object.keys(processedApiCallChartData[0]).filter(key => key !== 'dt') 
    : [];

  // 图表颜色
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#f7f3f7', '#cc3300', '#6699cc', '#996633'];

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

        {/* 图表2: API错误统计 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily API Errors by Prompt Version</CardTitle>
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
                  {uniquePromptVersions.map((version, index) => (
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

        {/* 图表3: 卡片类型API调用统计 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily API Calls by Card Type</CardTitle>
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
                  {uniqueCardTypes.map((type, index) => (
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

        {/* 图表4: 用户调用量分层统计 */}
        <Card>
          <CardHeader>
            <CardTitle>Daily User Call Volume and Tiers</CardTitle>
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
                  <Line yAxisId="left" type="monotone" dataKey="total_calls" stroke="#82ca9d" name="Total Calls" />
                  <Line yAxisId="left" type="monotone" dataKey="up2_users" stroke="#ffc658" name="Users > 2 Calls" />
                  <Line yAxisId="left" type="monotone" dataKey="up5_users" stroke="#ff7300" name="Users > 5 Calls" />
                  <Line yAxisId="left" type="monotone" dataKey="up8_users" stroke="#a4de6c" name="Users > 8 Calls" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_calls" stroke="#d0ed57" name="Avg Calls" />
                </LineChart>
              </ResponsiveContainer>
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
