'use client'

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Template as TemplateType } from '@/lib/template-config';
import { ImageViewer } from './ImageViewer';
interface TemplateProps {
  template: TemplateType;
}

export function Template({ template }: TemplateProps) {
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 flex flex-col border border-[#b19bff]">
      <CardHeader className="flex-grow">
        <CardTitle className="text-xl font-semibold text-gray-800">{template.name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ImageViewer svgContent={template.previewSvg} alt={template.name} cardId={template.cardId} cardType={template.cardType} isNewCard={false} />
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/${template.cardType}/${template.id}`} passHref className="w-full">
          <Button 
            className="w-full bg-pink-500 text-white hover:bg-pink-600 transition-colors duration-200"
          >
            {template.name}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}