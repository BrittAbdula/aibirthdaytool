import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy - AI Birthday Message Generator",
  alternates: {
    canonical: '/privacy-policy/',
  }
}

export default function PrivacyPolicy() {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Privacy Policy</h1>
        <Card className="card">
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              At MewTruCard, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our card generation service.
            </p>
            {/* 添加更多隐私政策内容 */}
          </CardContent>
        </Card>
      </main>
    );
}