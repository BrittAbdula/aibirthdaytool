import React from 'react';

interface StepProps {
  title: string;
  description: string;
}

export const Step: React.FC<StepProps> = ({ title, description }) => (
  <div className="flex items-start mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-4">
      {/* 这里可以添加步骤编号或图标 */}
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export const Steps: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-4">
    {children}
  </div>
);