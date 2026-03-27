"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  RefreshCcw,
  Calendar,
  MessageSquare,
  BookOpen,
  Bell,
  Settings,
  BarChart3,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/tiers", label: "Tiers", icon: Layers },
  { href: "/dues", label: "Dues", icon: CreditCard },
  { href: "/renewals", label: "Renewals", icon: RefreshCcw },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/communications", label: "Communications", icon: MessageSquare },
  { href: "/directory", label: "Directory", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const memberRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/directory", label: "Directory", icon: BookOpen },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/my-events", label: "My Events", icon: Calendar },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.members.getCurrentUser);

  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "StaffMember";
  const isBoard = currentUser?.role === "BoardMember";
  const routes = isAdmin ? adminRoutes : isBoard ? [...memberRoutes, { href: "/reports", label: "Reports", icon: BarChart3 }] : memberRoutes;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-primary">MemberHub</h1>
        </div>
        <SidebarMenu>
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
            return (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton render={<Link href={route.href} />} isActive={isActive} className="gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{route.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <UserButton />
          {currentUser && (
            <div className="text-sm">
              <p className="font-medium">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
