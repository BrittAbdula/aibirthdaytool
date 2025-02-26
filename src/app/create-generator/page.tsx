import { Metadata } from "next";
import GeneratorBuilder from "@/components/GeneratorBuilder";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Card Generator - MewTruCard",
  description: "Design and publish your own AI-powered card generator with our intuitive builder. Customize input fields, set design preferences, and share your unique card generator with friends, family, and the MewTruCard community.",
};

export default function CreateGeneratorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Main content */}
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-center mb-4 text-[#4A4A4A] tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Create Your Card Generator
            </span>
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto font-light">
            Design your own AI-powered card generator and share it with others
          </p>

          <Suspense fallback={
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <GeneratorBuilder />
          </Suspense>

          {/* Updated section for Card Generator Builder */}
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#4A4A4A]">How to Create Your Card Generator</h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-[#FFC0CB]">
                <h3 className="text-xl font-semibold text-[#4A4A4A]">Basic Setup</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    Name your generator and add a description
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    Customize input fields for your users
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    Choose field types (text, textarea, select, number)
                  </li>
                </ul>
              </div>

              <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border border-[#FFC0CB]">
                <h3 className="text-xl font-semibold text-[#4A4A4A]">Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✨ Pre-configured default fields</li>
                  <li>🎨 Customizable field types</li>
                  <li>🔗 Shareable generator link</li>
                  <li>🚀 Instant preview and testing</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-[#FFC0CB]">
              <h3 className="text-xl font-semibold mb-4 text-[#4A4A4A]">Tips for Success</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Choose a clear, descriptive name for your generator
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Add helpful placeholder text to guide users
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Make required fields clear with the required field indicator
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  Test your generator after creation using the &quot;Try It Now&quot; button
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
} 