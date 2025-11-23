import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min = 0, max = 100, step = 5, onChange }) => {
  return (
    <div>
      <label htmlFor="influence-slider" className="block text-sm font-medium text-white/80 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <input
          id="influence-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
             background: `linear-gradient(to right, #7D4FFF 0%, #7D4FFF ${value}%, #4A5568 ${value}%, #4A5568 100%)`
          }}
        />
        <span className="text-sm font-semibold text-white bg-white/10 px-2 py-1 rounded-md w-14 text-center">
          {value}%
        </span>
      </div>
    </div>
  );
};

export default Slider;
