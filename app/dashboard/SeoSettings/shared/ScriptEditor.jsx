"use client";

import { Wand2 } from "lucide-react";
import { ActionBtn, FormField, Textarea } from "@/app/components/Dashboard/DashUI";

const tidy = (value) => (value || "").replace(/>\s+</g, ">\n<").trim();

export default function ScriptEditor({ label, value, onChange, helpText }) {
  return (
    <FormField label={label} hint={helpText}>
      <Textarea
        rows={9}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="font-mono text-xs leading-5"
      />
      <div className="mt-2 flex justify-end">
        <ActionBtn type="button" variant="secondary" size="sm" icon={Wand2} onClick={() => onChange(tidy(value))}>
          Format
        </ActionBtn>
      </div>
    </FormField>
  );
}
