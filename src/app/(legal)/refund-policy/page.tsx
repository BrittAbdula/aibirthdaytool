import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Refund Policy - MewTruCard AI Greeting Card Generator",
  alternates: {
    canonical: '/refund-policy/',
  },
  description: "Learn how MewTruCard handles refunds for our AI Greeting Card Generator. Our refund policy outlines the conditions and procedures for requesting a refund.",
}

export default function RefundPolicy() {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Refund Policy</h1>
        <Card className="card">
          <CardHeader>
            <CardTitle>Our Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              At MewTruCard, we strive to provide our users with the best experience possible. We understand that circumstances may change, and you might need to request a refund. Please read our refund policy carefully before making a purchase.
            </p>
            
            <h2 className="text-2xl font-semibold">Refund Eligibility</h2>
            <ul className="list-disc pl-6">
              <li><strong>Time Limit:</strong> Refund requests must be made within 3 days of your purchase. After this period, we cannot process any refund requests.</li>
              <li><strong>Credit Usage:</strong> If you have used more than 50 credits, you are not eligible for a refund, regardless of the time since purchase.</li>
            </ul>

            <h2 className="text-2xl font-semibold">How to Request a Refund</h2>
            <p>
              If you meet the eligibility criteria and wish to request a refund, please follow these steps:
            </p>
            <ul className="list-disc pl-6">
              <li><strong>Contact Us:</strong> Reach out to our support team at support@mewtrucard.com.</li>
              <li><strong>Provide Details:</strong> Include your account details, order number, purchase date, and reason for the refund request.</li>
              <li><strong>Submit Within 3 Days:</strong> Ensure your request is submitted within 3 days of your purchase.</li>
            </ul>

            <h2 className="text-2xl font-semibold">Processing Refunds</h2>
            <p>
              Once we receive your refund request, we will review it and notify you of the outcome soon. If approved, your refund will be processed to your original payment method.
            </p>

            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p>
              We reserve the right to update our refund policy at any time. Any changes will be reflected on this page, and we encourage you to review it periodically.
            </p>

            <p className="text-sm text-gray-500">
              Last revised: May 11, 2025
            </p>
          </CardContent>
        </Card>
      </main>
    );
}