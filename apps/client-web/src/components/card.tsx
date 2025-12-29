import React from 'react';

export function Card({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }): any {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 rounded-xl border bg-white">
        <h1 className="text-xl font-semibold mb-4">{title}</h1>
        <div className="space-y-4">{children}</div>
      </div>
    );
  }