import * as React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
    >
      {children}
    </select>
  );
}