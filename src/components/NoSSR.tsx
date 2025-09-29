'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
}

function NoSSRWrapper({ children }: NoSSRProps) {
  return <>{children}</>;
}

const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Lade...</p>
      </div>
    </div>
  ),
});

export default NoSSR;