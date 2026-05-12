"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const RouteGuard = ({ allowedRoles, children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = typeof window !== "undefined" ? localStorage.getItem('type') : null;

  useEffect(() => {
    const menu = searchParams.get('menu');

    if (menu) {
      const hasAccess = checkMenuAccess(menu, type);
      if (!hasAccess) {
        router.push('/dashboard?menu=default');
      }
    }
  }, [searchParams, type, router]);

  const checkMenuAccess = (menu, userType) => {
    const accessRules = {
      admin: ['createCategory', 'editCategory', 'deleteCategory', 'manageUsers'],
      moderator: ['createCategory', 'viewCategories', 'viewProducts', 'viewCustomers'],
      user: ['viewProfile']
    };

    return accessRules[userType]?.includes(menu);
  };

  if (!allowedRoles?.includes(type)) {
    return null;
  }

  return children;
};

export default RouteGuard;