"use client";

import { ReactNode, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("Admin" | "StaffMember" | "BoardMember" | "Member")[];
  fallbackUrl?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/dashboard",
}: RoleGuardProps) {
  const router = useRouter();
  const currentUser = useQuery(api.members.getCurrentUser);

  useEffect(() => {
    if (currentUser === null) {
      router.push(fallbackUrl);
    } else if (
      currentUser &&
      !allowedRoles.includes(
        currentUser.role as "Admin" | "StaffMember" | "BoardMember" | "Member"
      )
    ) {
      router.push(fallbackUrl);
    }
  }, [currentUser, allowedRoles, fallbackUrl, router]);

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (
    currentUser === null ||
    !allowedRoles.includes(
      currentUser.role as "Admin" | "StaffMember" | "BoardMember" | "Member"
    )
  ) {
    return null;
  }

  return <>{children}</>;
}
