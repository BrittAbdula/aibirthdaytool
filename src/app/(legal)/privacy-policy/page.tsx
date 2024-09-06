import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - AI Birthday Message Generator",
  alternates: {
    canonical: '/privacy-policy/',
  }
}

export default function PrivacyPolicy() {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Privacy Policy</h1>
        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <p>
            Last updated: 2024/9/6
          </p>
          <p>
            At aibirthdaytool.com, we are committed to protecting your privacy. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information in our AI Birthday Message Generator extension.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Information Collection and Use</h2>
          <p>
            Our extension collects minimal information necessary to generate personalized birthday messages. This includes the recipient type, age, traits, and preferred message tone. We do not collect or store any personally identifiable information. All data processing occurs locally within your browser.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Data Storage</h2>
          <p>
            We use Chrome&apos;s storage API to save your language preferences locally on your device. This information is not transmitted to our servers and is solely used to enhance your user experience.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Third-Party Services</h2>
          <p>
            Our extension uses an API to generate birthday messages. The information you input (recipient type, age, traits, tone) is sent to this API. However, this data is not linked to any personally identifiable information and is not stored after the message is generated.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &apos;Last updated&apos; date.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@aibirthdaytool.com.
          </p>
        </div>
      </div>
    );
  }