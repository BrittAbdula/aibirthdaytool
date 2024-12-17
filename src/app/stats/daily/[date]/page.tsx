'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CollapsibleJson } from "@/components/ui/collapsible-json";
import { useRouter } from 'next/navigation';

interface DailyDetail {
  id: number;
  cardId: string;
  cardType: string;
  userInputs: any;
  promptVersion: string;
  responseContent: string;
  tokensUsed: number;
  duration: number;
  timestamp: string;
  isError: boolean;
  errorMessage?: string;
  r2Url?: string;
}

export default function DailyDetailPage({ params }: { params: { date: string } }) {
  const router = useRouter();
  const [details, setDetails] = useState<DailyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/user-stats/daily/${params.date}`);
        if (!response.ok) {
          throw new Error('Failed to fetch daily details');
        }
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching daily details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.date]);

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Daily Details - {params.date}</h2>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Stats
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Card Type</TableHead>
                    <TableHead>User Inputs</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{new Date(detail.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{detail.cardType}</TableCell>
                      <TableCell>
                        <CollapsibleJson 
                          data={typeof detail.userInputs === 'string' 
                            ? JSON.parse(detail.userInputs)
                            : detail.userInputs
                          } 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={detail.isError ? "text-red-500" : "text-green-500"}>
                            {detail.isError ? "Error" : "Success"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({detail.tokensUsed} tokens, {detail.duration}ms)
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
