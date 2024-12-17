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

interface DailyStat {
  dt: string;
  action_cards: number;
  unique_cards: number;
}

interface ErrorStat {
  dt: string;
  error_count: number;
  success_count: number;
  total_count: number;
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const fetchStats = async () => {
    if (!date?.from || !date?.to) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: date.from.toISOString().split('T')[0],
        endDate: date.to.toISOString().split('T')[0]
      });

      const response = await fetch(`/api/user-stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      if (data.stats && Array.isArray(data.stats)) {
        // 对图表数据按日期升序排序
        const sortedStats = [...data.stats].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime());
        const sortedErrorStats = [...data.errorStats].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime());
        // 对表格数据按日期降序排序
        const reversedStats = [...sortedStats].reverse();
        setStats(reversedStats);
        setErrorStats(sortedErrorStats);
      } else {
        setError('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [date]);

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

  // 为图表准备按时间升序排序的数据
  const chartStats = [...stats].reverse();
  const chartErrorStats = [...errorStats];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Activity Statistics</h1>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Card Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="action_cards" stroke="#8884d8" name="Total Actions" />
                  <Line type="monotone" dataKey="unique_cards" stroke="#82ca9d" name="Unique Cards" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Success vs Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartErrorStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success_count" stackId="a" fill="#82ca9d" name="Success" />
                  <Bar dataKey="error_count" stackId="a" fill="#ff0000" name="Error" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Actions</TableHead>
                  <TableHead className="text-right">Unique Cards</TableHead>
                  <TableHead className="text-right">Success/Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat, index) => {
                  const errorStat = errorStats.find(e => e.dt === stat.dt);
                  return (
                    <TableRow key={stat.dt}>
                      <TableCell 
                        className="cursor-pointer hover:text-primary hover:underline"
                        onClick={() => router.push(`/stats/daily/${stat.dt}`)}
                      >
                        {stat.dt}
                      </TableCell>
                      <TableCell className="text-right">{stat.action_cards}</TableCell>
                      <TableCell className="text-right">{stat.unique_cards}</TableCell>
                      <TableCell className="text-right">
                        {errorStat ? `${errorStat.success_count}/${errorStat.error_count}` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
