import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import OrderProvider from './context/OrderContext';
import HeaderProvider from "./context/HeaderContext";
import ProductProvider from "./context/ProductsContext";
import ClientLayout from "./components/ClientLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { buildSEO } from "./lib/seo";
import { config } from "@/config/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Root metadata. Child server pages override `title` and `description` via
// their own metadata/generateMetadata exports. The `template` form gives a
// consistent "Page Title | Brand" pattern site-wide.
export const metadata = {
  ...buildSEO({ path: '/' }),
  title: {
    default: config.siteName,
    template: `%s | ${config.siteName}`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <CartProvider>
            <ProductProvider>
              <HeaderProvider>
                <OrderProvider>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </OrderProvider>
              </HeaderProvider>
            </ProductProvider>
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}