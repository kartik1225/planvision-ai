interface PerspectiveControlsProps {
  angle: number;
  x: number;
  y: number;
  onAngleChange: (angle: number) => void;
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
}

export function PerspectiveControls({
  angle,
  x,
  y,
  onAngleChange,
  onXChange,
  onYChange,
}: PerspectiveControlsProps) {
  const getPositionDescription = () => {
    let horizontal = 'center';
    if (x < 30) horizontal = 'left';
    if (x > 70) horizontal = 'right';

    let vertical = 'middle';
    if (y < 30) vertical = 'top';
    if (y > 70) vertical = 'bottom';

    return `${angle}° from ${horizontal}-${vertical}`;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">Perspective (Optional)</label>

      {/* Angle slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Camera Angle</span>
          <span>{angle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          value={angle}
          onChange={(e) => onAngleChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-purple-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Position sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Horizontal (X)</span>
            <span>{x}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={x}
            onChange={(e) => onXChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-purple-500
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Vertical (Y)</span>
            <span>{y}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={y}
            onChange={(e) => onYChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-purple-500
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* Preview description */}
      <p className="text-xs text-slate-500">
        Preview: Camera at {getPositionDescription()}
      </p>
    </div>
  );
}
