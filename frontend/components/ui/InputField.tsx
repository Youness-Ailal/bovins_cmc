import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export default function InputField({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-inter text-sm font-medium text-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`h-11 w-full rounded border px-[14px] font-inter text-sm text-label bg-input placeholder:text-placeholder transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="font-inter text-xs text-placeholder leading-relaxed">{helperText}</p>
      )}
      {error && (
        <p className="font-inter text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
