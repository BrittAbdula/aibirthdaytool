'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CollapsibleJson } from "@/components/ui/collapsible-json";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { ArrowLeft } from "lucide-react";

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
  usageCount: number;
}

const getCardImageUrl = (timestamp: string, cardId: string) => {
  const date = new Date(timestamp);
  // 使用 UTC 时间来保持与 R2 存储路径一致
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `https://store.celeprime.com/cards/${year}/${month}/${day}/${cardId}.svg`;
};

export default function DailyDetailPage({ params }: { params: { date: string } }) {
  const router = useRouter();
  const [details, setDetails] = useState<DailyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');

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
    switch (usageFilter) {
      case 'used':
        return detail.usageCount > 0;
      case 'unused':
        return detail.usageCount === 0;
      default:
        return true;
    }
  });

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conversation History</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={usageFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsageFilter('all')}
              >
                All
              </Button>
              <Button
                variant={usageFilter === 'used' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsageFilter('used')}
              >
                Used
              </Button>
              <Button
                variant={usageFilter === 'unused' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsageFilter('unused')}
              >
                Unused
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
                    <TableHead>User Inputs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="space-x-2">
                      Usage
                    </TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetails.map((detail) => (
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{detail.usageCount}</span>
                          <span className="text-sm text-muted-foreground">times</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {!detail.isError && (
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
          <div className="relative aspect-square  bg-white p-20">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Card Preview"
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            )}
            {/* <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
