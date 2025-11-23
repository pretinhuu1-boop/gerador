import React from 'react';

interface CheckboxOption {
  id: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selected, onChange, label }) => {
  const handleChange = (id: string) => {
    const newSelection = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onChange(newSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center">
            <input
              id={`checkbox-${option.id}`}
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => handleChange(option.id)}
              className="w-4 h-4 text-[#7D4FFF] bg-gray-700 border-gray-600 rounded focus:ring-[#7D4FFF] focus:ring-2"
            />
            <label htmlFor={`checkbox-${option.id}`} className="ml-2 text-sm font-medium text-white/90">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
