// DatePicker.tsx
import React from 'react';

interface DatePickerProps {
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onChange, placeholder }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? new Date(event.target.value) : null;
    onChange(value);
  };

  return (
    <input
      type="date"
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
      onChange={handleDateChange}
      placeholder={placeholder || 'Select a date'}
    />
  );
};
