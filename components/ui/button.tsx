import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const styles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
    />
  );
}