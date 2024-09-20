import React from 'react'
import BirthdayCardGenerator from '@/components/birthday-card-generator'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <BirthdayCardGenerator />

      <section className="mt-16">
        <h2 className="text-3xl font-semibold mb-6 text-center text-purple-700">About Our Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Advantages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                MewTruCard&apos;s AI Card Generator helps you create unique, personalized cards. Whether it&apos;s for family, friends, or colleagues, we generate the perfect message for any occasion.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>Fill in the recipient&apos;s information in the form</li>
                <li>Choose your preferred card style</li>
                <li>Click the generate button</li>
                <li>Copy the generated card or make further customizations</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}