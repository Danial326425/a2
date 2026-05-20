"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Globe2,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Send,
  Share2,
  Smartphone,
} from "lucide-react";
import useSeoSettings from "@/app/hooks/useSeoSettings";
import useImageUpload from "@/app/hooks/useImageUpload";
import {
  ActionBtn,
  ErrorBanner,
  FormSkeleton,
  InfoBox,
  PageHeader,
  SectionCard,
  SuccessAlert,
  TabBar,
} from "@/app/components/Dashboard/DashUI";
import BasicSeoTab from "./BasicSeoTab";
import OpenGraphTab from "./OpenGraphTab";
import TwitterCardTab from "./TwitterCardTab";
import FaviconTab from "./FaviconTab";
import VerificationTab from "./VerificationTab";
import AdvancedSeoTab from "./AdvancedSeoTab";

const tabs = [
  { key: "basic-seo", label: "Basic SEO", icon: Search },
  { key: "open-graph", label: "Open Graph", icon: Share2 },
  { key: "twitter-card", label: "Twitter Card", icon: Send },
  { key: "favicon", label: "Favicon", icon: Smartphone },
  { key: "verification", label: "Verification", icon: KeyRound },
  { key: "advanced", label: "Advanced", icon: Code2 },
];

export default function SeoSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = tabs.some((tab) => tab.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "basic-seo";

  const seo = useSeoSettings();
  const imageUpload = useImageUpload(seo.updateField);

  useEffect(() => {
    const handler = (event) => {
      if (!seo.isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [seo.isDirty]);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        seo.saveSettings().then((result) => {
          if (result.ok) message.success("Settings saved successfully");
          else message.error("Please fix the highlighted fields");
        });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [seo]);

  const setActiveTab = (nextTab) => {
    if (seo.isDirty && !window.confirm("You have unsaved changes. Switch tabs without saving?")) {
      message.warning("You have unsaved changes");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", "seoSettings");
    params.set("tab", nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSave = async () => {
    const result = await seo.saveSettings();
    if (result.ok) message.success("Settings saved successfully");
    else message.error("Please fix the highlighted fields");
  };

  const tabProps = useMemo(
    () => ({
      settings: seo.settings,
      updateField: seo.updateField,
      imageUpload,
      errors: seo.validationErrors,
    }),
    [imageUpload, seo.settings, seo.updateField, seo.validationErrors]
  );

  const content = {
    "basic-seo": <BasicSeoTab {...tabProps} />,
    "open-graph": <OpenGraphTab {...tabProps} />,
    "twitter-card": <TwitterCardTab {...tabProps} />,
    favicon: <FaviconTab {...tabProps} />,
    verification: <VerificationTab {...tabProps} />,
    advanced: <AdvancedSeoTab {...tabProps} />,
  }[activeTab];

  return (
    <div className="space-y-5 pb-24">
      <PageHeader
        title="SEO Settings"
        subtitle="Manage global metadata, social previews, verification tags, icons, and crawler controls"
        icon={Globe2}
        badge={seo.isDirty ? "Unsaved" : "Saved"}
      />

      <ErrorBanner message={seo.error} />
      <SuccessAlert message={seo.success} />

      {seo.loading ? (
        <SectionCard>
          <FormSkeleton fields={8} />
        </SectionCard>
      ) : (
        <>
          <SectionCard className="sticky top-16 z-20" noPad>
            <div className="border-b border-gray-100 px-4 py-3">
              <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
            </div>
          </SectionCard>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SectionCard>{content}</SectionCard>
            </motion.div>
          </AnimatePresence>

          {Object.keys(seo.validationErrors).length > 0 && (
            <InfoBox variant="warning">
              Some fields need attention before saving. Open the relevant tab to fix the highlighted inputs.
            </InfoBox>
          )}

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">
                {seo.isDirty ? "You have unsaved changes." : "All changes are saved."}
              </div>
              <div className="flex justify-end gap-2">
                <ActionBtn type="button" variant="secondary" icon={RotateCcw} onClick={seo.resetChanges} disabled={!seo.isDirty || seo.saving}>
                  Discard
                </ActionBtn>
                <ActionBtn type="button" variant="primary" icon={seo.saving ? Loader2 : Save} onClick={handleSave} loading={seo.saving} disabled={!seo.isDirty}>
                  Save Changes
                </ActionBtn>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
