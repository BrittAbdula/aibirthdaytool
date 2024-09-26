import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WhyChooseMewTruCard() {
  return (
    <section className="mt-24">
      <h2 className="text-3xl font-serif font-semibold mb-8 text-center text-[#4A4A4A]">Why Choose MewTruCard?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">Personalized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">Create unique cards with custom messages and designs for your loved ones.</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">Quick & Easy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">Generate beautiful cards in seconds with our user-friendly interface.</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">Variety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">Choose from a wide range of card types for every occasion and celebration.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}