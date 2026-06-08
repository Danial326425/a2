"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navbar from "@/app/components/Dashboard/Navbar";
import Sidebar from "@/app/components/Dashboard/Sidebar";
import PrivateRoute from "./PrivateRoute";
import BizView from "./BizView/BizView";

// Dynamic imports for components with SSR issues (ReactQuill, browser-only libs)
const ViewHome = dynamic(() => import("./Home/ViewHome"), { ssr: false });
const CreateHome = dynamic(() => import("./Home/CreateHome"), { ssr: false });
const CreateCongratulation = dynamic(() => import("./Congratulation/CreateCongratulation"), { ssr: false });
const ViewCongratulation = dynamic(() => import("./Congratulation/ViewCongratulation"), { ssr: false });
const CreateForm = dynamic(() => import("./Form/CreateForm"), { ssr: false });
const ViewForm = dynamic(() => import("./Form/ViewForm"), { ssr: false });
const ViewTransaction = dynamic(() => import("./Transaction/ViewTransaction"), { ssr: false });
const CreateDeliveryCharge = dynamic(() => import("./DeliveryCharge/CreateDeliveryCharge"), { ssr: false });
const ViewDeliveryCharge = dynamic(() => import("./DeliveryCharge/ViewDeliveryCharge"), { ssr: false });
const CreatePixel = dynamic(() => import("./Pixel/CreatePixel"), { ssr: false });
const ViewPixel = dynamic(() => import("./Pixel/ViewPixel"), { ssr: false });
const CreateProductPage = dynamic(() => import("./ProductPage/CreateProductPage"), { ssr: false });
const ViewProductPage = dynamic(() => import("./ProductPage/ViewProductPage"), { ssr: false });
const ViewCustomer = dynamic(() => import("./Customer/ViewCustomer"), { ssr: false });
const CreateOrder = dynamic(() => import("./Customer/CreateOrder"), { ssr: false });
const CreateColor = dynamic(() => import("./Color/CreateColor"), { ssr: false });
const ViewColor = dynamic(() => import("./Color/ViewColor"), { ssr: false });
const CreateProduct = dynamic(() => import("./Product/CreateProduct"), { ssr: false });
const ViewProduct = dynamic(() => import("./Product/ViewProduct"), { ssr: false });
const CreateSize = dynamic(() => import("./Size/CreateSize"), { ssr: false });
const ViewSize = dynamic(() => import("./Size/ViewSize"), { ssr: false });
const CreateSteadfast = dynamic(() => import("./Steadfast/CreateSteadfast"), { ssr: false });
const ViewStedfast = dynamic(() => import("./Steadfast/ViewSteadfast"), { ssr: false });
const CreateCategory = dynamic(() => import("./Category/CreateCategory"), { ssr: false });
const ViewCategory = dynamic(() => import("./Category/ViewCategory"), { ssr: false });
const CreateLegal = dynamic(() => import("./Legal/CreateLegal"), { ssr: false });
const ViewLegal = dynamic(() => import("./Legal/ViewLegal"), { ssr: false });
const ViewContactUs = dynamic(() => import("./ContactUs/ViewContactUs"), { ssr: false });
const ViewAbout     = dynamic(() => import("./About/ViewAbout"), { ssr: false });
const ViewFooterSettings = dynamic(() => import("./FooterSettings/ViewFooterSettings"), { ssr: false });
const CreateMenu = dynamic(() => import("./Menu/CreateMenu"), { ssr: false });
const ViewMenu = dynamic(() => import("./Menu/ViewMenu"), { ssr: false });
const CreateSocial = dynamic(() => import("./Social/CreateSocial"), { ssr: false });
const ViewSocial = dynamic(() => import("./Social/ViewSocial"), { ssr: false });
const CreateWebsiteLogo = dynamic(() => import("./Branding/CreateWebsiteLogo"), { ssr: false });
const ViewWebsiteLogo = dynamic(() => import("./Branding/ViewWebsiteLogo"), { ssr: false });
const ViewUser = dynamic(() => import("./User/ViewUser"), { ssr: false });
const ViewLead = dynamic(() => import("./Lead/ViewLead"), { ssr: false });
const CreatePaymentMethod = dynamic(() => import("./PaymentMethod/CreatePaymentMethod"), { ssr: false });
const ViewPaymentMethod = dynamic(() => import("./PaymentMethod/ViewPaymentMethod"), { ssr: false });
const CreateCommunity = dynamic(() => import("./Community/CreateCommunity"), { ssr: false });
const ViewCommunity = dynamic(() => import("./Community/ViewCommunity"), { ssr: false });
const CreateAdvancePay = dynamic(() => import("./AdvancePay/CreateAdvancePay"), { ssr: false });
const ViewAdvancePay = dynamic(() => import("./AdvancePay/ViewAdvancePay"), { ssr: false });
const CreateBanner = dynamic(() => import("./Banner/CreateBanner"), { ssr: false });
const ViewBanner = dynamic(() => import("./Banner/ViewBanner"), { ssr: false });
const CreateLandingPage = dynamic(() => import("./LandingPage/CreateLandingPage"), { ssr: false });
const LandingPageView = dynamic(() => import("./LandingPage/LandingPageView"), { ssr: false });
const OwnTracking = dynamic(() => import("./Tracking/OwnTracking"), { ssr: false });
const CreateUpsellProduct = dynamic(() => import("./Upsell/CreateUpsellProduct"), { ssr: false });
const ViewUpsellProducts  = dynamic(() => import("./Upsell/ViewUpsellProducts"),  { ssr: false });
const UpsellSettings      = dynamic(() => import("./Upsell/UpsellSettings"),      { ssr: false });
const VariationLibrary    = dynamic(() => import("./Presets/VariationLibrary"),   { ssr: false });
const ViewOrderSettings   = dynamic(() => import("./OrderSettings/ViewOrderSettings"), { ssr: false });
const CreateCoupon        = dynamic(() => import("./Coupon/CreateCoupon"), { ssr: false });
const ViewCoupon          = dynamic(() => import("./Coupon/ViewCoupon"), { ssr: false });
const CreateCartReward    = dynamic(() => import("./CartReward/CreateCartReward"), { ssr: false });
const ViewCartReward      = dynamic(() => import("./CartReward/ViewCartReward"), { ssr: false });
const SeoSettingsPage     = dynamic(() => import("./SeoSettings/SeoSettingsPage"), { ssr: false });
const ViewReviews         = dynamic(() => import("./Reviews/ViewReviews"),         { ssr: false });
const InventoryOverview   = dynamic(() => import("./Inventory/InventoryOverview"), { ssr: false });
const StockReport         = dynamic(() => import("./Inventory/StockReport"),       { ssr: false });
const AdsPerformance      = dynamic(() => import("./AdsPerformance/AdsPerformance"), { ssr: false });


const Dashboard = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Initial menu comes from ?menu= so reload preserves the active section.
  // Falls back to 'dashboard' when missing.
  const menuFromUrl = searchParams.get('menu') || 'dashboard';
  const [selectedMenu, setSelectedMenuState] = useState(menuFromUrl);
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isCollapsed, setIsCollapsed]       = useState(false);
  const [userRole, setUserRole]             = useState(null);

  // Keep state in sync if user uses browser back/forward
  useEffect(() => {
    const next = searchParams.get('menu') || 'dashboard';
    if (next !== selectedMenu) setSelectedMenuState(next);
  }, [searchParams, selectedMenu]);

  // Setter that also pushes the menu into the URL (without scroll jump).
  const setSelectedMenu = useCallback((menu) => {
    setSelectedMenuState(menu);
    const params = new URLSearchParams(searchParams.toString());
    if (menu === 'dashboard') {
      params.delete('menu');
    } else {
      params.set('menu', menu);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    setIsCollapsed(localStorage.getItem("sidebarCollapsed") === "true");
    setUserRole(localStorage.getItem("type"));
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    setIsOverlayVisible(newState);
  };

  const handleOverlayClick = () => {
    toggleSidebar();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
        setIsOverlayVisible(false);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAccess = (menuKey) => {
    const accessRules = {
      admin: [
        // All admin accessible menus
        "dashboard",
        "createHome", "homeOverview", "createLegal", "legalOverview",
        "contactUsOverview", "aboutOverview", "footerOverview",
        "createMenu", "menuOverview", "createSocial", "socialOverview", "createLogo",
        "logoOverview", "createCategory", "categoryOverview", "createSize", "sizeOverview",
        "createDeliveryCharge", "deliveryChargeOverview", "createPixel", "PixelOverview",
        "createSteadfast", "steadfastOverview", "createProductPage", "productPageOverview",
        "createColor", "colorOverview", "createProduct", "productOverview", "createCongrates",
        "congratesOverview", "createForm", "formOverview", "customerOverview", "createOrder",
        "transactionOverview", "usersOverview", "dashboard", "leadOverview","createPaymentMethod",
        "paymentMethodOverview", "createCommunity", "communityOverview", "createAdvancePay", "advancePayOverview","createBanner", "bannerOverview", "createLandingPage","landingPageOverview",
        "trackingOverview",
        "seoSettings",
        "createUpsellProduct", "upsellProductOverview", "upsellSettings",
        "variationLibrary", "orderSettings",
        "createCoupon", "couponOverview", "createCartReward", "cartRewardOverview",
        "reviewsOverview",
        "inventoryOverview", "stockReport",
        "adsPerformance"
      ],
      moderator: [
        // Moderator specific access
        "categoryOverview", "productOverview", "customerOverview", "createOrder", "dashboard",
        "createCategory", "createProduct", "contactUsOverview", "createSteadfast", "steadfastOverview",
        "leadOverview", "createCommunity", "communityOverview","createBanner", "bannerOverview",
        "createUpsellProduct", "upsellProductOverview", "upsellSettings",
        "variationLibrary", "reviewsOverview",
        "inventoryOverview", "stockReport"
      ],
      user: ["dashboard"] // Basic user access
    };

    return accessRules[userRole]?.includes(menuKey) || false;
  };

  const renderContent = () => {
    if (!checkAccess(selectedMenu)) {
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-red-600">Access Denied</h3>
          <p>You don't have permission to access this page</p>
          <button 
            onClick={() => setSelectedMenu("dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    switch (selectedMenu) {
      case "createHome":
        return <CreateHome onHomeCreated={() => setSelectedMenu('homeOverview')} />;
      case "homeOverview":
        return <ViewHome />;
      case "createLegal":
        return <CreateLegal onLegalCreated={() => setSelectedMenu('legalOverview')} />;
      case "legalOverview":
        return <ViewLegal />;
      case "contactUsOverview":
        return <ViewContactUs />;
      case "aboutOverview":
        return <ViewAbout />;
      case "footerOverview":
        return <ViewFooterSettings />;
      case "createMenu":
        return <CreateMenu onMenuCreated={() => setSelectedMenu('menuOverview')} />;
      case "menuOverview":
        return <ViewMenu />;
      case "createSocial":
        return <CreateSocial onSocialCreated={() => setSelectedMenu('socialOverview')} />;
      case "socialOverview":
        return <ViewSocial />;
      case "createLogo":
        return <CreateWebsiteLogo onLogoCreated={() => setSelectedMenu('logoOverview')} />;
      case "logoOverview":
        return <ViewWebsiteLogo />;
      case "createCategory":
        return <CreateCategory onCategoryCreated={() => setSelectedMenu('categoryOverview')} />;
      case "categoryOverview":
        return <ViewCategory />;
      case "createSize":
        return <CreateSize onSizeCreated={() => setSelectedMenu('sizeOverview')} />;
      case "sizeOverview":
        return <ViewSize />;
      case "createDeliveryCharge":
        return <CreateDeliveryCharge onDeliveryChargeCreated={() => setSelectedMenu('deliveryChargeOverview')} />;
      case "deliveryChargeOverview":
        return <ViewDeliveryCharge />;
      case "createPixel":
        return <CreatePixel onPixelCreated={() => setSelectedMenu('PixelOverview')} />;
      case "PixelOverview":
        return <ViewPixel />;
      case "createPaymentMethod":
        return <CreatePaymentMethod onPaymentCreated={() => setSelectedMenu('paymentMethodOverview')} />;
      case "paymentMethodOverview":
        return <ViewPaymentMethod />;
      case "createSteadfast":
        return <CreateSteadfast onSteadfastCreated={() => setSelectedMenu('steadfastOverview')} />;
      case "steadfastOverview":
        return <ViewStedfast />;
      case "createProductPage":
        return <CreateProductPage onProductPageCreated={() => setSelectedMenu('productPageOverview')} />;
      case "productPageOverview":
        return <ViewProductPage />;
      case "createColor":
        return <CreateColor onColorCreated={() => setSelectedMenu('colorOverview')} />;
      case "colorOverview":
        return <ViewColor />;
      case "createProduct":
        return <CreateProduct onProductCreated={() => setSelectedMenu('productOverview')} />;
      case "productOverview":
        return <ViewProduct />;
      case "createCongrates":
        return <CreateCongratulation onCongratesCreated={() => setSelectedMenu('congratesOverview')} />;
      case "congratesOverview":
        return <ViewCongratulation />;
      case "createForm":
        return <CreateForm onFormCreated={() => setSelectedMenu('formOverview')} />;
      case "formOverview":
        return <ViewForm />;

      case "createCommunity":
        return <CreateCommunity onCommunityCreated={() => setSelectedMenu('communityOverview')} />;
      case "communityOverview":
        return <ViewCommunity />;

      case "createBanner":
        return <CreateBanner onBannerCreated={() => setSelectedMenu('bannerOverview')} />;
      case "bannerOverview":
        return <ViewBanner />;

      case "createAdvancePay":
        return <CreateAdvancePay onCodAdvanceCreated={() => setSelectedMenu('advancePayOverview')} />;
      case "advancePayOverview":
        return <ViewAdvancePay />;

      case "createLandingPage":
        return <CreateLandingPage onLandingPageCreated={() => setSelectedMenu('landingPageOverview')} />;
      case "landingPageOverview":
        return <LandingPageView />;

      case "trackingOverview":
        return <OwnTracking />;
      case "adsPerformance":
        return <AdsPerformance />;
      case "seoSettings":
        return <SeoSettingsPage />;

      case "createUpsellProduct":
        return <CreateUpsellProduct onCreated={() => setSelectedMenu('upsellProductOverview')} onCancel={() => setSelectedMenu('upsellProductOverview')} />;
      case "upsellProductOverview":
        return <ViewUpsellProducts onCreateNew={() => setSelectedMenu('createUpsellProduct')} />;
      case "upsellSettings":
        return <UpsellSettings />;

      case "variationLibrary":
        return <VariationLibrary />;

      case "orderSettings":
        return <ViewOrderSettings />;

      case "createCoupon":
        return <CreateCoupon onCouponCreated={() => setSelectedMenu('couponOverview')} />;
      case "couponOverview":
        return <ViewCoupon onCreateNew={() => setSelectedMenu('createCoupon')} />;

      case "createCartReward":
        return <CreateCartReward onCreated={() => setSelectedMenu('cartRewardOverview')} />;
      case "cartRewardOverview":
        return <ViewCartReward onCreateNew={() => setSelectedMenu('createCartReward')} />;

      case "createOrder":
        return <CreateOrder onOrderCreated={() => setSelectedMenu('customerOverview')} />;
      case "customerOverview":
        return <ViewCustomer />;
      case "leadOverview":
        return <ViewLead />;
      case "reviewsOverview":
        return <ViewReviews />;
      case "inventoryOverview":
        return <InventoryOverview />;
      case "stockReport":
        return <StockReport />;
      case "transactionOverview":
        return <ViewTransaction />;
      case "usersOverview":
        return <ViewUser />;
      case "dashboard":
        return <BizView />;
      default:
        return <div className="text-gray-700 p-4"><BizView /></div>;
    }
  };

  return (
    <PrivateRoute allowedRoles={["admin", "moderator", "user"]}>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Navbar
          toggleSidebar={toggleSidebar}
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
        />

        {isOverlayVisible && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
    
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          toggleSidebar={toggleSidebar}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className={`flex-1 min-w-0 overflow-x-hidden overflow-y-auto transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } pt-16`}>
          <div className={selectedMenu === 'dashboard' ? '' : 'p-4 md:p-6 max-w-7xl mx-auto'}>
            {selectedMenu === 'dashboard'
              ? renderContent()
              : <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 overflow-x-auto">{renderContent()}</div>
            }
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
};

// Suspense boundary is required around useSearchParams in Next.js App Router
// client components to avoid a CSR bailout warning / build error.
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSuspenseFallback />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardSuspenseFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );
}
