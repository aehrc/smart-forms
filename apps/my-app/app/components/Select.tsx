// Select.tsx
import React, { useState } from 'react';

interface SelectProps {
  onValueChange: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ onValueChange, defaultValue, children }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onValueChange(value);
  };

  return (
    <div className="relative inline-block w-full">
      <select
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
        value={selectedValue}
        onChange={(e) => handleChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children
}) => <option value={value}>{children}</option>;

export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <option value="" disabled>
    {placeholder}
  </option>
);
