"use client";

function formatDigits(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export default function MoneyInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (rawDigits: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder ?? "0"}
      value={formatDigits(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className={className}
    />
  );
}
