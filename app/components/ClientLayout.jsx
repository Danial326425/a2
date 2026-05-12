"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Don't show Header/Footer on dashboard, editor, auth routes, and offer pages
  const showHeaderFooter = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/editor') && !pathname?.startsWith('/login') && !pathname?.startsWith('/register') && !pathname?.startsWith('/offer');

  return (
    <>
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}