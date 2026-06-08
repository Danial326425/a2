"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Clock,
  Globe,
  ImageIcon,
  Layers,
  Users,
  Phone,
  Info,
  Share2,
  Shield,
  CreditCard,
  ArrowUpCircle,
  Gift,
  Wallet,
  Truck,
  Receipt,
  BarChart2,
  Activity,
  Network,
  UserCog,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Tag,
  Ticket,
  FileText,
  Star,
  PanelLeftClose,
  PanelLeft,
  X,
  MenuIcon,
  Search,
} from "lucide-react";
import axios from "axios";
import { config } from "@/config/config";

const apiUrl = config.apiUrl;

// ── Menu groups ──────────────────────────────────────────────────────────────
const MENU_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        key: "dashboard",
        directItem: "dashboard",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        title: "Products",
        icon: Package,
        key: "products",
        subMenus: [
          {
            title: "Products",
            key: "productsSub",
            subItems: [
              { name: "Add Product", key: "createProduct" },
              { name: "View Products", key: "productOverview" },
            ],
          },
          {
            title: "Categories",
            key: "categoriesSub",
            subItems: [
              { name: "Add Category", key: "createCategory" },
              { name: "View Categories", key: "categoryOverview" },
            ],
          },
          {
            title: "Variation Library",
            key: "variationLibrarySub",
            subItems: [
              { name: "Colors & Sizes Library", key: "variationLibrary" },
            ],
          },
          {
            title: "Landing Pages",
            key: "landingPageSub",
            subItems: [
              { name: "View Landing Pages", key: "landingPageOverview" },
            ],
          },
        ],
      },
      {
        title: "Inventory",
        icon: Boxes,
        key: "inventory",
        subMenus: [
          {
            title: "Inventory",
            key: "inventorySub",
            subItems: [
              { name: "Stock Overview", key: "inventoryOverview" },
              { name: "Stock Report", key: "stockReport" },
            ],
          },
        ],
      },
      {
        title: "Upsell Funnel",
        icon: Gift,
        key: "upsell",
        subMenus: [
          {
            title: "Upsell Products",
            key: "upsellProductsSub",
            subItems: [
              { name: "Add Upsell Product", key: "createUpsellProduct" },
              { name: "View Upsell Products", key: "upsellProductOverview" },
            ],
          },
          {
            title: "Page Settings",
            key: "upsellSettingsSub",
            subItems: [
              { name: "Upsell Page Settings", key: "upsellSettings" },
            ],
          },
        ],
      },
      {
        title: "Orders",
        icon: ShoppingCart,
        key: "customers",
        directItem: "customerOverview",
      },
      {
        title: "Incomplete Orders",
        icon: Clock,
        key: "leads",
        directItem: "leadOverview",
      },
      {
        title: "Reviews",
        icon: Star,
        key: "reviews",
        directItem: "reviewsOverview",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Payments",
        icon: CreditCard,
        key: "payments",
        subMenus: [
          {
            title: "Advance Pay",
            key: "advancePay",
            subItems: [
              { name: "Add Advance Pay", key: "createAdvancePay" },
              { name: "View Advance Pay", key: "advancePayOverview" },
            ],
          },
          {
            title: "Payment Method",
            key: "paymentMethod",
            subItems: [
              { name: "Add Payment Method", key: "createPaymentMethod" },
              { name: "View Payment Methods", key: "paymentMethodOverview" },
            ],
          },
          {
            title: "Delivery Charge",
            key: "deliveryCharge",
            subItems: [
              { name: "Add Delivery", key: "createDeliveryCharge" },
              { name: "View Delivery Charges", key: "deliveryChargeOverview" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Tracking Setup",
        icon: BarChart2,
        key: "pixel",
        subMenus: [
          {
            title: "Facebook Pixel",
            key: "pixelSub",
            subItems: [
              { name: "Add Pixel", key: "createPixel" },
              { name: "View Pixels", key: "PixelOverview" },
            ],
          },
        ],
      },
      {
        title: "Own Analytics",
        icon: Activity,
        key: "ownTracking",
        directItem: "trackingOverview",
      },
      {
        title: "Ads Performance",
        icon: BarChart2,
        key: "adsPerformance",
        directItem: "adsPerformance",
      },
      {
        title: "SEO Settings",
        icon: Search,
        key: "seo",
        directItem: "seoSettings",
      },
    ],
  },
  {
    label: "Promotions",
    items: [
      {
        title: "Coupons",
        icon: Ticket,
        key: "coupons",
        subMenus: [
          {
            title: "Coupons",
            key: "couponsSub",
            subItems: [
              { name: "Add Coupon", key: "createCoupon" },
              { name: "View Coupons", key: "couponOverview" },
            ],
          },
        ],
      },
      {
        title: "Cart Rewards",
        icon: Gift,
        key: "cartRewards",
        subMenus: [
          {
            title: "Cart Reward Tiers",
            key: "cartRewardsSub",
            subItems: [
              { name: "Add Tier", key: "createCartReward" },
              { name: "View Tiers", key: "cartRewardOverview" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Courier Setup",
        icon: Network,
        key: "steadfast",
        subMenus: [
          {
            title: "All Couriers",
            key: "steadfastSub",
            subItems: [
              { name: "Add Courier", key: "createSteadfast" },
              { name: "View Couriers", key: "steadfastOverview" },
            ],
          },
        ],
      },
      {
        title: "Site Management",
        icon: Globe,
        key: "siteManagement",
        subMenus: [
          {
            title: "Menu",
            key: "menu",
            subItems: [
              { name: "Add Menu", key: "createMenu" },
              { name: "View Menus", key: "menuOverview" },
            ],
          },
          {
            title: "Website Logo",
            key: "logo",
            subItems: [
              { name: "Add Logo", key: "createLogo" },
              { name: "View Logos", key: "logoOverview" },
            ],
          },
          {
            title: "Banner",
            key: "banner",
            subItems: [
              { name: "Add Banner", key: "createBanner" },
              { name: "View Banners", key: "bannerOverview" },
            ],
          },
          {
            title: "Community",
            key: "community",
            subItems: [
              { name: "Add Community", key: "createCommunity" },
              { name: "View Communities", key: "communityOverview" },
            ],
          },
          {
            title: "Contact Us",
            key: "contactUs",
            subItems: [
              { name: "Contact Us", key: "contactUsOverview" },
            ],
          },
          {
            title: "About Us",
            key: "aboutUs",
            subItems: [
              { name: "About Us", key: "aboutOverview" },
            ],
          },
          {
            title: "Footer",
            key: "footerSettings",
            subItems: [
              { name: "Copyright Text", key: "footerOverview" },
            ],
          },
          {
            title: "Social Links",
            key: "social",
            subItems: [
              { name: "Add Social", key: "createSocial" },
              { name: "View Social Links", key: "socialOverview" },
            ],
          },
          {
            title: "Legal Pages",
            key: "legal",
            subItems: [
              { name: "Add Legal", key: "createLegal" },
              { name: "View Legal Pages", key: "legalOverview" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Users",
        icon: UserCog,
        key: "users",
        directItem: "usersOverview",
      },
      {
        title: "Order Settings",
        icon: Shield,
        key: "orderSettings",
        directItem: "orderSettings",
      },
    ],
  },
];

// ── Role access rules ────────────────────────────────────────────────────────
const ROLE_ACCESS = {
  admin: {
    dashboard: ["dashboard"],
    products: {
      productsSub: ["createProduct", "productOverview"],
      categoriesSub: ["createCategory", "categoryOverview"],
      variationLibrarySub: ["variationLibrary"],
      landingPageSub: ["createLandingPage", "landingPageOverview"],
    },
    inventory: {
      inventorySub: ["inventoryOverview", "stockReport"],
    },
    upsell: {
      upsellProductsSub: ["createUpsellProduct", "upsellProductOverview"],
      upsellSettingsSub: ["upsellSettings"],
    },
    customers: ["customerOverview"],
    leads: ["leadOverview"],
    reviews: ["reviewsOverview"],
    siteManagement: {
      menu: ["createMenu", "menuOverview"],
      logo: ["createLogo", "logoOverview"],
      banner: ["createBanner", "bannerOverview"],
      community: ["createCommunity", "communityOverview"],
      contactUs: ["contactUsOverview"],
      aboutUs: ["aboutOverview"],
      footerSettings: ["footerOverview"],
      social: ["createSocial", "socialOverview"],
      legal: ["createLegal", "legalOverview"],
    },
    payments: {
      advancePay: ["createAdvancePay", "advancePayOverview"],
      paymentMethod: ["createPaymentMethod", "paymentMethodOverview"],
      deliveryCharge: ["createDeliveryCharge", "deliveryChargeOverview"],
    },
    pixel: { pixelSub: ["createPixel", "PixelOverview"] },
    ownTracking: ["trackingOverview"],
    adsPerformance: ["adsPerformance"],
    seo: ["seoSettings"],
    coupons: { couponsSub: ["createCoupon", "couponOverview"] },
    cartRewards: { cartRewardsSub: ["createCartReward", "cartRewardOverview"] },
    steadfast: { steadfastSub: ["createSteadfast", "steadfastOverview"] },
    users: ["usersOverview"],
    orderSettings: ["orderSettings"],
  },
  moderator: {
    dashboard: ["dashboard"],
    products: {
      productsSub: ["createProduct", "productOverview"],
      categoriesSub: ["createCategory", "categoryOverview"],
      variationLibrarySub: ["variationLibrary"],
    },
    inventory: {
      inventorySub: ["inventoryOverview", "stockReport"],
    },
    upsell: {
      upsellProductsSub: ["createUpsellProduct", "upsellProductOverview"],
      upsellSettingsSub: ["upsellSettings"],
    },
    customers: ["customerOverview"],
    leads: ["leadOverview"],
    reviews: ["reviewsOverview"],
    siteManagement: {
      banner: ["createBanner", "bannerOverview"],
      community: ["createCommunity", "communityOverview"],
      contactUs: ["contactUsOverview"],
    },
    payments: {
      advancePay: ["createAdvancePay", "advancePayOverview"],
      paymentMethod: ["createPaymentMethod", "paymentMethodOverview"],
    },
    steadfast: { steadfastSub: ["createSteadfast", "steadfastOverview"] },
  },
  user: { dashboard: ["dashboard"] },
};

// ── Main Sidebar component ───────────────────────────────────────────────────
const Sidebar = ({
  isSidebarOpen,
  selectedMenu,
  setSelectedMenu,
  toggleSidebar,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    setUserRole(localStorage.getItem("type") || "user");
    setUserName(localStorage.getItem("user") || "Admin");
  }, []);

  const access = ROLE_ACCESS[userRole] || {};

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-expand tree for active menu
  useEffect(() => {
    for (const group of MENU_GROUPS) {
      for (const item of group.items) {
        if (item.directItem === selectedMenu) {
          setExpandedMenu(item.key);
          return;
        }
        if (item.subMenus) {
          for (const sub of item.subMenus) {
            if (sub.subItems?.some((leaf) => leaf.key === selectedMenu)) {
              setExpandedMenu(item.key);
              setExpandedSubMenu(sub.key);
              return;
            }
          }
        }
      }
    }
  }, [selectedMenu]);

  const hasAccess = useCallback(
    (mainKey, subKey = null, itemKey = null) => {
      if (!access[mainKey]) return false;
      if (!subKey) {
        return Array.isArray(access[mainKey])
          ? access[mainKey].length > 0
          : Object.keys(access[mainKey]).length > 0;
      }
      if (!access[mainKey][subKey]) return false;
      if (!itemKey) return access[mainKey][subKey].length > 0;
      return access[mainKey][subKey].includes(itemKey);
    },
    [access]
  );

  const handleLeafClick = useCallback(
    (key) => {
      setSelectedMenu(key);
      if (isMobile) toggleSidebar();
    },
    [setSelectedMenu, isMobile, toggleSidebar]
  );

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${apiUrl}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("type");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  const collapsed = isCollapsed && !isMobile;

  return (
    <motion.aside
      animate={{
        x: isMobile && !isSidebarOpen ? -264 : 0,
        width: isMobile ? 256 : collapsed ? 64 : 256,
      }}
      transition={{ type: "spring", damping: 28, stiffness: 220, mass: 0.8 }}
      className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-[#0d1117] border-r border-[#21262d] flex flex-col overflow-hidden shadow-2xl"
      style={{ willChange: "width, transform" }}
    >
      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand" : "Collapse"}
          className="absolute top-3 right-2.5 z-10 p-1.5 rounded-md text-[#6e7681] hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
        </button>
      )}

      {/* Mobile close */}
      {isMobile && isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-[#6e7681] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      )}

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 sidebar-scroll">
        {MENU_GROUPS.map((group) => {
          const visible = group.items.filter((item) => hasAccess(item.key));
          if (!visible.length) return null;

          return (
            <div key={group.label} className="mb-1">
              {/* Group label */}
              {!collapsed ? (
                <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#3d444d]">
                  {group.label}
                </p>
              ) : (
                <div className="mx-auto my-3 w-6 h-px bg-[#21262d]" />
              )}

              {visible.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  collapsed={collapsed}
                  selectedMenu={selectedMenu}
                  expandedMenu={expandedMenu}
                  setExpandedMenu={setExpandedMenu}
                  expandedSubMenu={expandedSubMenu}
                  setExpandedSubMenu={setExpandedSubMenu}
                  hasAccess={hasAccess}
                  onLeafClick={handleLeafClick}
                />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Bottom panel */}
      <div className="border-t border-[#21262d] bg-[#0d1117] py-2 px-1.5 space-y-0.5">
        {/* View Website */}
        <SideBtn
          icon={<ExternalLink size={17} className="shrink-0" />}
          label="View Website"
          collapsed={collapsed}
          onClick={() => window.open("/", "_blank")}
          className="text-[#6e7681] hover:text-white hover:bg-white/5"
          title="View Website"
        />

        {/* User identity */}
        <div
          className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-[11px] font-bold text-white uppercase">
              {userName.charAt(0)}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#cdd9e5] truncate">{userName}</p>
              <p className="text-[10px] text-[#3d444d] capitalize">{userRole}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <SideBtn
          icon={<LogOut size={17} className="shrink-0" />}
          label="Logout"
          collapsed={collapsed}
          onClick={handleLogout}
          className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
          title="Logout"
        />
      </div>
    </motion.aside>
  );
};

// ── Shared bottom button ─────────────────────────────────────────────────────
const SideBtn = ({ icon, label, collapsed, onClick, className, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${className} ${
      collapsed ? "justify-center" : ""
    }`}
  >
    {icon}
    {!collapsed && <span className="text-sm truncate">{label}</span>}
  </button>
);

// ── NavItem (L1) ─────────────────────────────────────────────────────────────
const NavItem = memo(
  ({
    item,
    collapsed,
    selectedMenu,
    expandedMenu,
    setExpandedMenu,
    expandedSubMenu,
    setExpandedSubMenu,
    hasAccess,
    onLeafClick,
  }) => {
    const Icon = item.icon;
    const isExpanded = expandedMenu === item.key;

    const isActive = item.directItem
      ? selectedMenu === item.directItem
      : item.subMenus?.some((sub) =>
          sub.subItems?.some((leaf) => leaf.key === selectedMenu)
        );

    const handleClick = () => {
      if (item.directItem) {
        onLeafClick(item.directItem);
      } else {
        setExpandedMenu(isExpanded ? null : item.key);
        if (isExpanded) setExpandedSubMenu(null);
      }
    };

    return (
      <div>
        <button
          onClick={handleClick}
          title={collapsed ? item.title : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 relative group transition-all duration-150
            border-l-2
            ${isActive
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
              : "border-transparent text-[#8b949e] hover:text-[#cdd9e5] hover:bg-white/[0.04]"
            }
            ${collapsed ? "justify-center px-0" : ""}
          `}
        >
          <Icon size={17} className="shrink-0" />

          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium text-left truncate">
                {item.title}
              </span>
              {item.subMenus && (
                <ChevronDown
                  size={13}
                  className={`shrink-0 text-[#6e7681] transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </>
          )}

          {/* Tooltip when collapsed */}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#161b22] border border-[#21262d] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
              {item.title}
            </span>
          )}
        </button>

        {/* L2 submenu — hidden when collapsed */}
        {!collapsed && item.subMenus && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="sub"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                {item.subMenus.map((sub) => {
                  if (!hasAccess(item.key, sub.key)) return null;
                  return (
                    <SubMenu
                      key={sub.key}
                      sub={sub}
                      mainKey={item.key}
                      selectedMenu={selectedMenu}
                      expandedSubMenu={expandedSubMenu}
                      setExpandedSubMenu={setExpandedSubMenu}
                      hasAccess={hasAccess}
                      onLeafClick={onLeafClick}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }
);

// ── SubMenu (L2) ─────────────────────────────────────────────────────────────
const SubMenu = memo(
  ({
    sub,
    mainKey,
    selectedMenu,
    expandedSubMenu,
    setExpandedSubMenu,
    hasAccess,
    onLeafClick,
  }) => {
    const isExpanded = expandedSubMenu === sub.key;
    const hasActiveLeaf = sub.subItems?.some((leaf) => leaf.key === selectedMenu);

    return (
      <div className="ml-7 mr-1">
        <button
          onClick={() => setExpandedSubMenu(isExpanded ? null : sub.key)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-colors ${
            hasActiveLeaf
              ? "text-indigo-400"
              : "text-[#6e7681] hover:text-[#cdd9e5] hover:bg-white/[0.04]"
          }`}
        >
          <ChevronRight
            size={12}
            className={`shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <span className="truncate">{sub.title}</span>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.ul
              key="leaves"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden ml-4 border-l border-[#21262d] pl-2.5 py-0.5 space-y-0.5"
            >
              {sub.subItems?.map((leaf) => {
                if (!hasAccess(mainKey, sub.key, leaf.key)) return null;
                const active = selectedMenu === leaf.key;
                return (
                  <li key={leaf.key}>
                    <button
                      onClick={() => onLeafClick(leaf.key)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        active
                          ? "text-indigo-400 bg-indigo-500/10 font-medium"
                          : "text-[#6e7681] hover:text-[#cdd9e5] hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          active ? "bg-indigo-400" : "bg-[#3d444d]"
                        }`}
                      />
                      {leaf.name}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

export default Sidebar;
