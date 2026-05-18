"use client";

import React from "react";
import { Ticket } from "lucide-react";
import { PageHeader } from "../../components/Dashboard/DashUI";
import CouponForm from "./CouponForm";

const CreateCoupon = ({ onCouponCreated }) => (
  <div>
    <PageHeader
      title="Add Coupon"
      subtitle="Create a category-based discount, percentage, or free-delivery coupon"
      icon={Ticket}
    />
    <CouponForm
      mode="create"
      onSaved={() => onCouponCreated && onCouponCreated()}
    />
  </div>
);

export default CreateCoupon;
