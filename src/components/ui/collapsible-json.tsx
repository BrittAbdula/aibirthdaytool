import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface CollapsibleJsonProps {
  data: any;
}

export function CollapsibleJson({ data }: CollapsibleJsonProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-sm">{String(data)}</span>;
  }

  const entries = Object.entries(data);
  const preview = entries
    .slice(0, 2)
    .map(([key]) => key)
    .join(', ') + (entries.length > 2 ? '...' : '');

  return (
    <div className="font-mono text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="ml-1">{preview}</span>
      </Button>
      
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {entries.map(([key, value]) => (
            <div key={key} className="flex">
              <span className="text-blue-500 mr-2">{key}:</span>
              {typeof value === 'object' && value !== null ? (
                <CollapsibleJson data={value} />
              ) : (
                <span className="text-green-500">{String(value)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
