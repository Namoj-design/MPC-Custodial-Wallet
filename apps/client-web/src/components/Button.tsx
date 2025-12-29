import React from 'react';
export function Button({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
      <button
        className="w-full py-2 rounded-lg bg-black text-white disabled:opacity-50"
        {...props}
      >
        {children}
      </button>
    );
  }