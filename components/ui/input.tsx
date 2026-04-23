import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
    />
  );
}