import React from 'react'
import BirthdayCardGenerator from '@/components/birthday-card-generator'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">AI Birthday Card Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gray-100 p-6 rounded-lg shadow">
          <BirthdayCardGenerator />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">About Our Service</h2>
          <p className="text-gray-600 mb-4">
            Our AI Birthday Card Generator helps you create unique, personalized birthday cards. Whether it&apos;s for family, friends, or colleagues, we can generate the perfect birthday message for any occasion.
          </p>
          <h3 className="text-xl font-semibold mb-2">How to Use</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>Fill in the recipient&apos;s information in the form on the left</li>
            <li>Choose your preferred card style</li>
            <li>Click the generate button</li>
            <li>Copy the generated card or make further customizations</li>
          </ol>
        </div>
      </div>
    </div>
  )
}