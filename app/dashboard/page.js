"use client";

import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
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
const CreateContact = dynamic(() => import("./Contact/CreateContact"), { ssr: false });
const ViewContact = dynamic(() => import("./Contact/ViewContact"), { ssr: false });
const CreateContactInfo = dynamic(() => import("./ContactInfo/CreateContactInfo"), { ssr: false });
const ViewContactInfo = dynamic(() => import("./ContactInfo/ViewContactInfo"), { ssr: false });
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


const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null);

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
        "createContact", "contactOverview", "createContactInfo", "contactInfoOverview",
        "createMenu", "menuOverview", "createSocial", "socialOverview", "createLogo",
        "logoOverview", "createCategory", "categoryOverview", "createSize", "sizeOverview",
        "createDeliveryCharge", "deliveryChargeOverview", "createPixel", "PixelOverview",
        "createSteadfast", "steadfastOverview", "createProductPage", "productPageOverview",
        "createColor", "colorOverview", "createProduct", "productOverview", "createCongrates",
        "congratesOverview", "createForm", "formOverview", "customerOverview", "createOrder",
        "transactionOverview", "usersOverview", "dashboard", "leadOverview","createPaymentMethod",
        "paymentMethodOverview", "createCommunity", "communityOverview", "createAdvancePay", "advancePayOverview","createBanner", "bannerOverview", "createLandingPage","landingPageOverview",
        "trackingOverview"
      ],
      moderator: [
        // Moderator specific access
        "categoryOverview", "productOverview", "customerOverview", "createOrder", "dashboard",
        "createCategory", "createProduct", "contactOverview", "createSteadfast", "steadfastOverview",
        "leadOverview", "createCommunity", "communityOverview","createBanner", "bannerOverview"
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
      case "createContact":
        return <CreateContact onContactCreated={() => setSelectedMenu('contactOverview')} />;
      case "contactOverview":
        return <ViewContact />;
      case "createContactInfo":
        return <CreateContactInfo onContactInfoCreated={() => setSelectedMenu('contactInfoOverview')} />;
      case "contactInfoOverview":
        return <ViewContactInfo />;
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

      case "createOrder":
        return <CreateOrder onOrderCreated={() => setSelectedMenu('customerOverview')} />;
      case "customerOverview":
        return <ViewCustomer />;
      case "leadOverview":
        return <ViewLead />;
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

        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } pt-16`}>
          <div className={selectedMenu === 'dashboard' ? '' : 'p-4 md:p-6 max-w-7xl mx-auto'}>
            {selectedMenu === 'dashboard'
              ? renderContent()
              : <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">{renderContent()}</div>
            }
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
};

export default Dashboard;