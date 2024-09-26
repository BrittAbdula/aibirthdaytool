import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowToUse() {
  return (
    <section className="mt-24">
      <h2 className="text-3xl font-serif font-semibold mb-8 text-center text-[#4A4A4A]">How to Use MewTruCard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">1. Enter Name</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">Start by entering the recipient&apos;s name.</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">2. Generate Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">We&apos;ll create an elegant, universally appealing MewTruCard for you.</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#FFC0CB]">
          <CardHeader>
            <CardTitle className="font-serif text-[#4A4A4A]">3. Personalize (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A4A4A]">For a more tailored card, provide additional details about the recipient.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}