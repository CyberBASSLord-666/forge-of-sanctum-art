
import React from 'react';
import { Card } from '@/components/ui/card';
import { GeometricLoader } from '@/components/ui/geometric-loader';

interface LoadingScreenProps {
  viewport?: {
    deviceType: string;
    width: number;
    height: number;
  } | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ viewport }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center space-y-6">
          <GeometricLoader />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading MuseForge</h3>
            <p className="text-gray-600">
              Preparing your creative workspace
              {viewport && ` for ${viewport.deviceType} (${viewport.width}×${viewport.height})`}...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
