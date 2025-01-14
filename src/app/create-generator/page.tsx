import { Metadata } from "next";
import GeneratorBuilder from "@/components/GeneratorBuilder";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Card Generator - MewTruCard",
  description: "Create your own custom card generator with MewTruCard's AI-powered platform",
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
            Design your own AI-powered card generator for any occasion
          </p>

          <Suspense fallback={
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <GeneratorBuilder />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 