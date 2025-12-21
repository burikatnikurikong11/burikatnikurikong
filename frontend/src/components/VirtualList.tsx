/**
 * Virtual Scrolling Component for large lists
 * Only renders visible items for better performance
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage component for tourist spots
interface TouristSpot {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface VirtualTouristListProps {
  spots: TouristSpot[];
  onSpotClick: (spot: TouristSpot) => void;
}

export const VirtualTouristList: React.FC<VirtualTouristListProps> = ({
  spots,
  onSpotClick,
}) => {
  return (
    <VirtualList
      items={spots}
      itemHeight={120}
      containerHeight={600}
      renderItem={(spot) => (
        <div
          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => onSpotClick(spot)}
        >
          <div className="flex gap-3">
            <img
              src={spot.image}
              alt={spot.name}
              className="w-20 h-20 object-cover rounded"
              loading="lazy"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{spot.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {spot.description}
              </p>
            </div>
          </div>
        </div>
      )}
      overscan={2}
    />
  );
};
