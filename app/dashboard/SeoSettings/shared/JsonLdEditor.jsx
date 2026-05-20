"use client";

import { FileJson, Wand2 } from "lucide-react";
import { ActionBtn, FormField, InfoBox, Select, Textarea } from "@/app/components/Dashboard/DashUI";
import { validateJson } from "@/app/lib/seo/validators";

const templates = {
  Organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "",
    url: "",
    logo: "",
  },
  Website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "",
    url: "",
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
  },
};

export default function JsonLdEditor({ value, onChange }) {
  const state = validateJson(value);

  const formatJson = () => {
    if (!value?.trim()) return;
    const parsed = JSON.parse(value);
    onChange(JSON.stringify(parsed, null, 2));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <FormField label="Schema template">
          <Select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) onChange(JSON.stringify(templates[event.target.value], null, 2));
            }}
          >
            <option value="">Choose a template</option>
            {Object.keys(templates).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
        </FormField>
        <ActionBtn type="button" variant="secondary" icon={Wand2} onClick={formatJson} disabled={!value?.trim() || !state.valid}>
          Format JSON
        </ActionBtn>
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <FileJson size={15} />
          Rich Results Test
        </a>
      </div>
      <FormField label="JSON-LD Structured Data" error={state.valid ? "" : state.message}>
        <Textarea
          rows={12}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="font-mono text-xs leading-5"
        />
      </FormField>
      {state.valid && value?.trim() && <InfoBox variant="success">JSON structure is valid.</InfoBox>}
    </div>
  );
}
