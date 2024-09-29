import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy - MewTruCard AI Greeting Card Generator",
  alternates: {
    canonical: '/privacy-policy/',
  },
  description: "MewTruCard's privacy policy for the AI Greeting Card Generator service.",
}

export default function PrivacyPolicy() {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Privacy Policy</h1>
        <Card className="card">
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              At MewTruCard, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our AI Greeting Card Generator service.
            </p>
            
            <h2 className="text-2xl font-semibold">Data Collection</h2>
            <p>
              MewTruCard attaches great importance to user privacy. We collect certain information from our users to provide and improve our AI Greeting Card Generator service. This includes:
            </p>
            <ul className="list-disc pl-6">
              <li>Your email address</li>
              <li>Username</li>
              <li>Greeting card content you generate</li>
              <li>Information about the recipient (e.g., name, relationship, interests, occasion)</li>
            </ul>
            <p>
              We may also collect information about your device and how you use our website, such as your IP address, browser type, and operating system. This data helps us understand how our users interact with our platform and allows us to enhance their experience.
            </p>

            <h2 className="text-2xl font-semibold">Data Usage</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6">
              <li>Provide you with our AI Greeting Card Generator service</li>
              <li>Improve and maintain our platform</li>
              <li>Communicate with you about our services, such as sending updates or notifications</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
            <p>
              We will never sell or share your personal information with third parties for their own marketing purposes without your consent.
            </p>

            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p>
              We take the security of your data seriously. We use industry-standard encryption and other measures to protect your information from unauthorized access, disclosure, or misuse. In the event of a data breach, we will notify you and any relevant authorities as required by law.
            </p>

            <h2 className="text-2xl font-semibold">Children's Privacy Protection</h2>
            <p>
              Our services are not available to children under the age of 13, and we do not knowingly collect information from them. Any person under 13 needs the consent of their parents or guardian to use the products or services of MewTruCard.
            </p>

            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete the personal information we hold about you. You can also request that we limit or stop processing your data, or export your data in a portable format.
            </p>

            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p>
              If you have any questions or concerns about our privacy practices, or would like to exercise your rights, please contact us at support@mewtrucard.com.
            </p>

            <p className="text-sm text-gray-500">
              Last revised: Seq 24, 2024
            </p>
          </CardContent>
        </Card>
      </main>
    );
}