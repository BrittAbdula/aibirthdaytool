import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy - MewTruCard AI Greeting Card Generator",
  alternates: {
    canonical: '/privacy-policy/',
  },
  description: "Learn how MewTruCard collects, uses, and protects your personal information when using our AI Greeting Card Generator. Our detailed privacy policy outlines data security measures, user rights, and our commitment to safeguarding your privacy.",
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
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We will never sell or share your personal information with third parties for their own marketing purposes without your consent.
            </p>

            <h2 className="text-2xl font-semibold">Legal Basis for Processing</h2>
            <p>
              We process your data on the following legal bases:
            </p>
            <ul className="list-disc pl-6">
              <li><strong>Consent:</strong> We collect and process your data with your explicit consent for specific purposes.</li>
              <li><strong>Contract:</strong> Processing is necessary to fulfill our contractual obligations to you when providing our services.</li>
              <li><strong>Legitimate Interests:</strong> We may process your data based on our legitimate interests, such as improving our services or ensuring security, provided these interests are not overridden by your rights.</li>
              <li><strong>Legal Compliance:</strong> We may process your data to comply with legal obligations.</li>
            </ul>

            <h2 className="text-2xl font-semibold">Cookies and Similar Technologies</h2>
            <p>
              Our website uses cookies and similar technologies to enhance your experience and collect information about how you use our platform. Cookies are small text files stored on your device that help us recognize you and remember your preferences.
            </p>
            <p>
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6">
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly.</li>
              <li><strong>Performance Cookies:</strong> These help us understand how visitors interact with our website.</li>
              <li><strong>Functionality Cookies:</strong> These remember your preferences and personalize your experience.</li>
              <li><strong>Targeting Cookies:</strong> These track your activity to deliver targeted advertising.</li>
            </ul>
            <p>
              You can control cookies through your browser settings and our cookie consent tool. However, disabling certain cookies may affect the functionality of our website.
            </p>

            <h2 className="text-2xl font-semibold">Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements. Once your data is no longer needed, we will securely delete or anonymize it.
            </p>

            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p>
              We take the security of your data seriously. We use industry-standard encryption and other measures to protect your information from unauthorized access, disclosure, or misuse. In the event of a data breach, we will notify you and any relevant authorities as required by law.
            </p>

            <h2 className="text-2xl font-semibold">International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have different data protection laws. When we transfer your data internationally, we implement appropriate safeguards to ensure your data remains protected in accordance with this Privacy Policy and applicable laws.
            </p>

            <h2 className="text-2xl font-semibold">Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6">
              <li><strong>Right to Access:</strong> You can request copies of your personal information.</li>
              <li><strong>Right to Rectification:</strong> You can request that we correct inaccurate or incomplete information.</li>
              <li><strong>Right to Erasure:</strong> You can request that we delete your personal information in certain circumstances.</li>
              <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your personal information.</li>
              <li><strong>Right to Data Portability:</strong> You can request to receive your personal data in a structured, commonly used format.</li>
              <li><strong>Right to Object:</strong> You can object to our processing of your personal information in certain circumstances.</li>
              <li><strong>Rights Related to Automated Decision-making and Profiling:</strong> You can object to automated decision-making or profiling that significantly affects you.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below. Please note that these rights may be limited in some circumstances by local law requirements.
            </p>

            <h2 className="text-2xl font-semibold">California Consumer Privacy Act (CCPA) Rights</h2>
            <p>
              If you are a California resident, you have the following additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6">
              <li>The right to know what personal information we collect, use, disclose, and sell about you</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt-out of the sale of your personal information</li>
              <li>The right to non-discrimination for exercising your CCPA rights</li>
            </ul>

            <h2 className="text-2xl font-semibold">Children&apos;s Privacy Protection</h2>
            <p>
              Our services are not available to children under the age of 13, and we do not knowingly collect information from them. Any person under 13 needs the consent of their parents or guardian to use the products or services of MewTruCard.
            </p>

            <h2 className="text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last revised&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>

            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p>
              If you have any questions or concerns about our privacy practices, or would like to exercise your rights, please contact us at support@mewtrucard.com.
            </p>

            <p className="text-sm text-gray-500">
              Last revised: September 30, 2024
            </p>
          </CardContent>
        </Card>
      </main>
    );
}