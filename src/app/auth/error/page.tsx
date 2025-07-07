'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">认证错误</h1>
        
        {error && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">错误类型:</p>
            <p className="font-medium text-gray-900">{error}</p>
          </div>
        )}
        
        {errorDescription && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">错误描述:</p>
            <p className="font-medium text-gray-900">{errorDescription}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
} 