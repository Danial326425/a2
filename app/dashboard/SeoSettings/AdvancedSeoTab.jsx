"use client";

import { ShieldAlert } from "lucide-react";
import { FormField, InfoBox, Textarea } from "@/app/components/Dashboard/DashUI";
import ScriptEditor from "./shared/ScriptEditor";
import JsonLdEditor from "./shared/JsonLdEditor";

export default function AdvancedSeoTab({ settings, updateField, errors }) {
  return (
    <div className="space-y-5">
      <InfoBox variant="warning" className="flex items-center gap-2">
        <ShieldAlert size={15} />
        Only paste trusted scripts. Malicious code can compromise your site.
      </InfoBox>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ScriptEditor label="Header Script" value={settings.header_scripts} onChange={(v) => updateField("header_scripts", v)} helpText="Injected before the closing head tag." />
        <ScriptEditor label="Footer Script" value={settings.footer_scripts} onChange={(v) => updateField("footer_scripts", v)} helpText="Injected before the closing body tag." />
      </div>
      <JsonLdEditor value={settings.json_ld} onChange={(v) => updateField("json_ld", v)} error={errors.json_ld} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <FormField label="robots.txt content">
          <Textarea rows={9} value={settings.robots_txt || ""} onChange={(event) => updateField("robots_txt", event.target.value)} className="font-mono text-xs leading-5" />
        </FormField>
        <FormField label="Custom sitemap.xml additions">
          <Textarea rows={9} value={settings.sitemap_additions || ""} onChange={(event) => updateField("sitemap_additions", event.target.value)} className="font-mono text-xs leading-5" />
        </FormField>
      </div>
    </div>
  );
}
