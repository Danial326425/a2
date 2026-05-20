"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import PixelPageView from "./PixelPageView";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const showHeaderFooter =
    !pathname?.startsWith('/dashboard') &&
    !pathname?.startsWith('/editor') &&
    !pathname?.startsWith('/login') &&
    !pathname?.startsWith('/register') &&
    !pathname?.startsWith('/offer');

  return (
    <>
      <PixelPageView />
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}
