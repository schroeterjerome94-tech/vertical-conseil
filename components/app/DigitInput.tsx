"use client";

import { useState } from "react";

function keepDecimalInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "");
  const sep = cleaned.search(/[.,]/);
  if (sep < 0) return cleaned;
  return (
    cleaned.slice(0, sep + 1) + cleaned.slice(sep + 1).replace(/[.,]/g, "")
  );
}

export function DigitInput({
  name,
  defaultValue,
  className,
  emptyRed = false,
  maxDigits,
  decimal = false,
}: {
  name: string;
  defaultValue?: string;
  className?: string;
  emptyRed?: boolean;
  maxDigits?: number;
  decimal?: boolean;
}) {
  const [value, setValue] = useState(() => {
    const raw = String(defaultValue ?? "");
    if (decimal) return keepDecimalInput(raw);
    const digits = raw.replace(/\D/g, "");
    return maxDigits ? digits.slice(0, maxDigits) : digits;
  });
  const showRed = emptyRed && !value.trim();

  return (
    <input
      name={name}
      value={value}
      onChange={(event) => {
        if (decimal) {
          setValue(keepDecimalInput(event.target.value));
          return;
        }
        const digits = event.target.value.replace(/\D/g, "");
        setValue(maxDigits ? digits.slice(0, maxDigits) : digits);
      }}
      inputMode={decimal ? "decimal" : "numeric"}
      maxLength={maxDigits}
      autoComplete="off"
      className={`${className ?? ""} ${showRed ? "border-red-600 text-red-600" : ""}`}
    />
  );
}

export function TextInput({
  name,
  defaultValue,
  className,
  emptyRed = false,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  className?: string;
  emptyRed?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  const showRed = emptyRed && !value.trim();

  return (
    <input
      name={name}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      autoComplete="off"
      placeholder={placeholder}
      className={`${className ?? ""} placeholder:text-muted ${showRed ? "border-red-600 text-red-600" : ""}`}
    />
  );
}

export function SelectInput({
  name,
  defaultValue,
  options,
  emptyLabel = "Choisir",
  className,
  emptyRed = false,
  required = false,
}: {
  name: string;
  defaultValue?: string;
  options: readonly string[];
  emptyLabel?: string;
  className?: string;
  emptyRed?: boolean;
  required?: boolean;
}) {
  const [value, setValue] = useState(String(defaultValue ?? ""));
  const showRed = emptyRed && !value.trim();
  const list = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <select
      name={name}
      value={value}
      required={required}
      onChange={(event) => setValue(event.target.value)}
      className={`${className ?? ""} ${showRed ? "border-red-600 text-red-600" : "border-line text-navy"}`}
    >
      <option value="">{emptyLabel}</option>
      {list.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
