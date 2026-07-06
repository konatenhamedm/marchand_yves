"use client";

import React from "react";
import { useSession } from "next-auth/react";
import AdminDashboard from "./AdminDashboard";
import MerchantDashboard from "./MerchantDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const user = session?.user as any;
  if (!user) return null;

  if (user.kind === "admin") {
    return <AdminDashboard />;
  }

  return <MerchantDashboard />;
}