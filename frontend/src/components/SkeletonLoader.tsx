/**
 * Skeleton Loading Components for better perceived performance
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClass = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant];

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }[animation];

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`}
      style={style}
    />
  );
};

// Map skeleton loader
export const MapSkeleton: React.FC = () => (
  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Skeleton variant="circular" width={48} height={48} className="mx-auto mb-4" />
        <Skeleton variant="text" width={200} height={20} className="mb-2" />
        <Skeleton variant="text" width={150} height={16} />
      </div>
    </div>
  </div>
);

// Tourist spot card skeleton
export const TouristSpotCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
    <Skeleton variant="rectangular" width="100%" height={192} className="mb-4" />
    <Skeleton variant="text" width="80%" height={24} className="mb-2" />
    <Skeleton variant="text" width="100%" height={16} className="mb-2" />
    <Skeleton variant="text" width="90%" height={16} className="mb-4" />
    <div className="flex gap-2">
      <Skeleton variant="rectangular" width={80} height={32} />
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  </div>
);

// Chat message skeleton
export const ChatMessageSkeleton: React.FC = () => (
  <div className="flex gap-3 p-4">
    <Skeleton variant="circular" width={40} height={40} />
    <div className="flex-1">
      <Skeleton variant="text" width="30%" height={16} className="mb-2" />
      <Skeleton variant="text" width="100%" height={16} className="mb-1" />
      <Skeleton variant="text" width="90%" height={16} className="mb-1" />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
  </div>
);

// List skeleton
interface SkeletonListProps {
  count?: number;
  itemComponent?: React.ComponentType;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  itemComponent: ItemComponent = TouristSpotCardSkeleton,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <ItemComponent key={index} />
    ))}
  </div>
);
