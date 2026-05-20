"use client";

import { Info } from "lucide-react";
import { FormField, Input } from "@/app/components/Dashboard/DashUI";

const counterColor = (length, maxLength, recommendedRange) => {
  if (maxLength && length > maxLength) return "text-red-600";
  if (recommendedRange && length >= recommendedRange[0] && length <= recommendedRange[1]) return "text-emerald-600";
  return "text-gray-400";
};

export default function SeoInput({
  label,
  value,
  onChange,
  maxLength,
  recommendedRange,
  helpText,
  error,
  type = "text",
  ...props
}) {
  const text = value ?? "";
  const color = counterColor(String(text).length, maxLength, recommendedRange);

  return (
    <FormField
      label={
        helpText ? (
          <span className="inline-flex items-center gap-1.5">
            {label}
            <Info size={13} className="text-gray-400" aria-label={helpText} title={helpText} />
          </span>
        ) : label
      }
      error={error}
    >
      <Input
        type={type}
        value={text}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {maxLength && (
        <div className={`mt-1 text-right text-xs ${color}`}>
          {String(text).length}/{maxLength} characters
        </div>
      )}
    </FormField>
  );
}
