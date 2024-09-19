import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - AI Birthday Card Generator",
  alternates: {
    canonical: '/terms-of-service/',
  }
}

export default function TermsOfService() {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Terms of Service</h1>
        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <p>
            Last updated: 2024/9/6
          </p>
          <p>
            Welcome to aibirthdaytool.com. By using our AI Birthday Message Generator extension, you agree to comply with and be bound by the following terms and conditions of use.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Use of the Service</h2>
          <p>
            aibirthdaytool.com provides an AI-powered tool for generating personalized birthday messages. You may use this service for personal, non-commercial purposes only. The generated messages should not be used for any harmful, discriminatory, or unlawful purposes.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Intellectual Property</h2>
          <p>
            The AI-generated messages are provided for your personal use. You may not claim copyright or other intellectual property rights over the generated content. The extension and its underlying technology remain the property of aibirthdaytool.com.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">No Warranties</h2>
          <p>
            This service is provided &ldquo;as is&ldquo; without any representations or warranties, express or implied. We do not guarantee the accuracy, completeness, or appropriateness of the generated messages for all situations.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Limitations of Liability</h2>
          <p>
            We will not be liable for any indirect, special or consequential loss; or for any business losses, loss of revenue, income, profits or anticipated savings resulting from your use of this extension.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Modifications to the Service</h2>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice to you. We shall not be liable to you or to any third party for any modification, suspension or discontinuance of the service.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the State of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Changes to These Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@aibirthdaytool.com.
          </p>
        </div>
      </div>
    );
  }