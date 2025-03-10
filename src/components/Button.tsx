import React, { MouseEventHandler } from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
};

export function Button({ children, onClick, className, disabled = false }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`bg-blue-500 text-white px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
}
