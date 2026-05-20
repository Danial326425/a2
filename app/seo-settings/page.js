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
