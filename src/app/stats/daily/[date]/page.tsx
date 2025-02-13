'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CollapsibleJson } from "@/components/ui/collapsible-json";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface ApiCallDetail {
  id: number;
  cardId: string;
  cardType: string;
  userInputs: any;
  promptVersion: string;
  tokensUsed: number;
  duration: number;
  timestamp: string;
  isError: boolean;
  errorMessage?: string;
  r2Url?: string;
  user: {
    name: string;
    email: string;
  } | null;
  responseSizeKB: number;
}

export default function DailyDetailPage({ params }: { params: { date: string } }) {
  const router = useRouter();
  const [details, setDetails] = useState<ApiCallDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

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

  const filteredDetails = details.filter(detail => {
    switch (statusFilter) {
      case 'success':
        return !detail.isError;
      case 'error':
        return detail.isError;
      default:
        return true;
    }
  });

  // Calculate summary statistics
  const summary = {
    totalCalls: details.length,
    successfulCalls: details.filter(d => !d.isError).length,
    failedCalls: details.filter(d => d.isError).length,
    averageTokens: Math.round(details.reduce((acc, d) => acc + d.tokensUsed, 0) / details.length) || 0,
    averageDuration: Math.round(details.reduce((acc, d) => acc + d.duration, 0) / details.length) || 0,
    totalTokens: details.reduce((acc, d) => acc + d.tokensUsed, 0),
  };

  const getCardImageUrl = (timestamp: string, cardId: string) => {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `https://store.celeprime.com/cards/${year}/${month}/${day}/${cardId}.svg`;
  };

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/stats')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCalls}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Success: {summary.successfulCalls} | Failed: {summary.failedCalls}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageDuration}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTokens}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Average: {summary.averageTokens} per call
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>API Call History</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('success')}
              >
                Success
              </Button>
              <Button
                variant={statusFilter === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('error')}
              >
                Error
              </Button>
            </div>
          </div>
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
                    <TableHead>User</TableHead>
                    <TableHead>Inputs</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Prompt Version</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetails.map((detail) => (
                    <TableRow key={detail.id} className={detail.isError ? 'bg-red-50/50' : ''}>
                      <TableCell>{new Date(detail.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{detail.cardType}</TableCell>
                      <TableCell>
                        {detail.user ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{detail.user.name}</span>
                            <span className="text-xs text-muted-foreground">{detail.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <CollapsibleJson 
                          data={typeof detail.userInputs === 'string' 
                            ? JSON.parse(detail.userInputs)
                            : detail.userInputs
                          } 
                          defaultExpanded={false}
                        />
                      </TableCell>
                      <TableCell>{detail.tokensUsed}</TableCell>
                      <TableCell>{detail.duration}ms</TableCell>
                      <TableCell>{detail.promptVersion}</TableCell>
                      <TableCell>
                        {!detail.isError && detail.r2Url && (
                          <button
                            onClick={() => setSelectedImage(getCardImageUrl(detail.timestamp, detail.cardId))}
                            className="block relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-colors duration-200 cursor-pointer group"
                          >
                            <Image
                              src={getCardImageUrl(detail.timestamp, detail.cardId)}
                              alt={`Card ${detail.cardId}`}
                              fill
                              className="object-contain transition-transform duration-200 group-hover:scale-105"
                              sizes="80px"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center">
                              <span className="text-xs text-white/0 group-hover:text-white/90 bg-black/0 group-hover:bg-black/30 px-2 py-1 rounded transition-all duration-200">
                                View
                              </span>
                            </div>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <div className="relative aspect-square bg-white p-20">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Card Preview"
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
