import React from 'react';
import { Check, Circle } from 'lucide-react';

type FileStatus = {
  png: boolean;
  webp: boolean;
};

interface IconStatusProps {
  status: FileStatus;
}

export const IconStatus: React.FC<IconStatusProps> = ({ status }) => {
  return (
    <div className="flex flex-col space-y-1 text-sm">
      <span className={`flex items-center ${status.png ? 'text-green-500' : 'text-gray-400'}`}>
        {status.png ? <Check className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
        PNG
      </span>
      <span className={`flex items-center ${status.webp ? 'text-green-500' : 'text-gray-400'}`}>
        {status.webp ? <Check className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
        WebP
      </span>
    </div>
  );
};