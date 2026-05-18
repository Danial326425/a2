"use client";

import React from "react";
import { Gift } from "lucide-react";
import { PageHeader } from "../../components/Dashboard/DashUI";
import CartRewardForm from "./CartRewardForm";

const CreateCartReward = ({ onCreated }) => (
  <div>
    <PageHeader
      title="Add Cart Reward Tier"
      subtitle="Automatic discount when cart reaches a threshold"
      icon={Gift}
    />
    <CartRewardForm
      mode="create"
      onSaved={() => onCreated && onCreated()}
    />
  </div>
);

export default CreateCartReward;
