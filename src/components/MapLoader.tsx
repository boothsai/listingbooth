'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const NewConstructionMap = dynamic(() => import('@/components/NewConstructionMap'), { ssr: false });

export default function MapLoader({ projects }: { projects: any[] }) {
  return <NewConstructionMap projects={projects} />;
}
