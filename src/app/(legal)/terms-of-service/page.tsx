import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service - MewTruCard AI Greeting Card Generator",
  alternates: {
    canonical: '/terms-of-service/',
  },
  description: "MewTruCard's terms of service for the AI Greeting Card Generator service.",
}

export default function TermsOfService() {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Terms of Service</h1>
        <Card className="card">
          <CardHeader>
            <CardTitle>MewTruCard AI Greeting Card Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="font-semibold">Effective Date: Seq 24, 2024</p>

            <h2 className="text-2xl font-semibold">1. Definitions</h2>
            <p>In these Terms of Service, the following definitions apply:</p>
            <ul className="list-disc pl-6">
              <li>MewTruCard: The website and platform operated by MewTruCard Inc.</li>
              <li>Service: The AI Greeting Card Generator platform and all related services provided by MewTruCard Inc.</li>
              <li>User: Any individual or entity that accesses or uses the Service.</li>
              <li>Content: All text, images, videos, audio, or other materials generated or displayed on the Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold">2. User Accounts</h2>
            <p>
              To use the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update this information as necessary to keep it current.
            </p>

            <h2 className="text-2xl font-semibold">3. Intellectual Property</h2>
            <p>
              The Service, including its content, features, and functionality, is owned by MewTruCard Inc. and is protected by copyright, trademark, and other intellectual property laws. You may not modify, copy, distribute, transmit, display, reproduce, or create derivative works from the Service without our prior written consent.
            </p>

            <h2 className="text-2xl font-semibold">4. Prohibited Conduct</h2>
            <p>You agree not to engage in any of the following prohibited conduct while using the Service:</p>
            <ul className="list-disc pl-6">
              <li>Violating any applicable law or regulation, including but not limited to copyright, trademark, or other intellectual property laws.</li>
              <li>Uploading, posting, or transmitting any Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another&apos;s privacy.</li>
              <li>Impersonating any person or entity, or falsely stating or misrepresenting your affiliation with a person or entity.</li>
              <li>Interfering with or disrupting the Service or its servers and networks.</li>
            </ul>

            <h2 className="text-2xl font-semibold">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, for any reason, including if we reasonably believe that you have violated these Terms of Service. Upon termination, your right to use the Service will immediately cease, and we may delete or remove any Content associated with your account.
            </p>

            <h2 className="text-2xl font-semibold">6. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. MewTruCard Inc. does not warrant that the Service will be uninterrupted or error-free, or that defects will be corrected. MewTruCard Inc. disclaims all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p>
              In no event shall MewTruCard Inc. be liable for any indirect, special, incidental, or consequential damages arising out of or in connection with the Service, including but not limited to lost profits, business interruption, or loss of data. MewTruCard Inc.&apos;s total liability to you for any and all claims shall not exceed $100.
            </p>

            <h2 className="text-2xl font-semibold">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold MewTruCard Inc., its affiliates, officers, agents, and employees harmless from any claim or demand, including reasonable attorneys&apos; fees, made by any third party due to or arising out of your use of the Service, your violation of these Terms of Service, or your violation of any rights of another.
            </p>

            <h2 className="text-2xl font-semibold">9. Governing Law</h2>
            <p>
              These Terms of Service and your use of the Service shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law.
            </p>

            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Service or the Service, please contact us at:
            </p>
            <p>Email: support@mewtrucard.com</p>

            <p className="text-sm text-gray-500">
              Last updated: Seq 24, 2024
            </p>
          </CardContent>
        </Card>
      </main>
    );
}