"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MessageSquare, Mail, Settings, HelpCircle } from "lucide-react";
import { PageHeader, TabBar } from "../../components/Dashboard/DashUI";

const ViewContact     = dynamic(() => import("../Contact/ViewContact"),     { ssr: false });
const ContactSettings = dynamic(() => import("./ContactSettings"),          { ssr: false });
const FaqManager      = dynamic(() => import("./FaqManager"),               { ssr: false });

const TABS = [
  { key: "settings", label: "Email / Phone / Address", icon: Settings },
  { key: "faq",      label: "FAQ",                     icon: HelpCircle },
  { key: "messages", label: "Messages",                icon: Mail },
];

const ViewContactUs = () => {
  const [active, setActive] = useState("settings");

  return (
    <div>
      <PageHeader
        title="Contact Us"
        icon={MessageSquare}
        subtitle="Manage contact info shown to customers + view incoming messages"
      />

      <div className="mb-5">
        <TabBar tabs={TABS} active={active} onChange={setActive} />
      </div>

      {active === "settings" && <ContactSettings />}
      {active === "faq"      && <FaqManager />}
      {active === "messages" && <ViewContact />}
    </div>
  );
};

export default ViewContactUs;
