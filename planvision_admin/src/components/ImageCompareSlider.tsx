import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ImageCompareSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original',
  afterLabel = 'Generated',
}: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video overflow-hidden cursor-ew-resize select-none rounded-t-2xl"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After image (background - right side) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=After';
        }}
      />

      {/* Before image (clipped - left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute top-0 left-0 h-full object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw',
            maxWidth: 'none',
          }}
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=Before';
          }}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-purple-500">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded backdrop-blur-sm">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600/90 text-white text-xs font-medium rounded backdrop-blur-sm">
        {afterLabel}
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Drag hint */}
      {sliderPosition === 50 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm animate-pulse">
          Drag to compare
        </div>
      )}
    </div>
  );
}
