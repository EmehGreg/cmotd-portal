import * as React from "react";

type FieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}