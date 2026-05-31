"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SeoSettingsShortcut() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab") || "basic-seo";
    router.replace(`/dashboard?menu=seoSettings&tab=${encodeURIComponent(tab)}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" />
    </div>
  );
}

export default function SeoSettingsShortcutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-100"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600" /></div>}>
      <SeoSettingsShortcut />
    </Suspense>
  );
}

// This page serves as a shortcut to redirect users to the SEO Settings tab in the dashboard. It uses the useEffect hook to perform the redirection when the component mounts, ensuring that users are taken directly to the relevant section of the dashboard without needing to navigate through multiple steps. The Suspense component provides a fallback loading indicator while the redirection is being processed.
