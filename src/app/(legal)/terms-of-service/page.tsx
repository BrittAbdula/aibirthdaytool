import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service - MewTruCard",
  alternates: {
    canonical: '/terms-of-service/',
  }
}

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Terms of Service</h1>
      <Card className="card">
        <CardHeader>
          <CardTitle>MewTruCard Terms of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Welcome to MewTruCard. By using our service, you agree to comply with and be bound by the following terms and conditions.
          </p>
          {/* 添加更多服务条款内容 */}
        </CardContent>
      </Card>
    </main>
  );
}