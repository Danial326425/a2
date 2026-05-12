"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PrivateRoute = ({ children, allowedRoles }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserRole(localStorage.getItem("type"));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.push("/login");
    } else if (allowedRoles && !allowedRoles.includes(userRole)) {
      router.push("/dashboard");
    }
  }, [isLoading, token, userRole, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default PrivateRoute;