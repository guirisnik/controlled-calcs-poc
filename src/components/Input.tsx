import React from "react";

type InputProps = {
  value: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  placeholder?: string;
  className?: string;
};

export function Input({ value, onChange, placeholder, className }: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded p-2 w-full ${className}`}
    />
  );
}
