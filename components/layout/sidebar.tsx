"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

type SidebarUser = {
  name?: string | null;
  role?: string | null;
};

type NavChild = {
  name: string;
  href: string;
};

type NavItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavChild[];
};

type SidebarProps = {
  user: SidebarUser;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Manage Students",
    href: "/students",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Registration",
    href: "/students/new",
    icon: UserPlus,
    roles: ["ADMIN"],
  },
  {
    name: "Attendance",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { name: "View Attendance", href: "/attendance" },
      { name: "Add Attendance", href: "/attendance/new" },
    ],
  },
  {
    name: "Weekly Report",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { name: "Add Report", href: "/reports/weekly/new" },
      { name: "View Report", href: "/reports/weekly" },
    ],
  },
  {
    name: "Monthly Report",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      { name: "Add Report", href: "/reports/monthly/new" },
      { name: "View Report", href: "/reports/monthly" },
    ],
  },
  {
    name: "Admins Report",
    href: "/reports/admins",
    icon: FileText,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Manage Admins",
    href: "/admins",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Log Out",
    href: "/logout",
    icon: LogOut,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Change Password",
    href: "/change-password",
    icon: Lock,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isExactActive = (href: string) => pathname === href;
  const isSectionActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Attendance: true,
    "Weekly Report": false,
    "Monthly Report": false,
  });

  const role = user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(role)),
    [role]
  );

  const toggleMenu = (name: string) => {
    if (collapsed) return;
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={`flex h-screen flex-col bg-primary text-white transition-all duration-300 ${
        collapsed ? "w-[84px]" : "w-[235px]"
      }`}
    >
      <div
        className={`flex h-[102px] items-center bg-white transition-all duration-300 ${
          collapsed ? "justify-center px-2" : "justify-center px-4"
        }`}
      >
        <Image
          src="/logos/somatrix-logo.jpeg"
          alt="Somatrix Logo"
          width={collapsed ? 48 : 190}
          height={collapsed ? 48 : 70}
          className="h-auto object-contain"
        />
      </div>

      <div className="flex h-[58px] items-center border-y border-white/10 bg-primary">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`flex w-full items-center text-white ${
            collapsed ? "justify-center" : "justify-end px-6"
          }`}
          aria-label="Toggle navigation"
        >
          <Menu className="h-8 w-8" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const childActive = item.children?.some((child) =>
            isExactActive(child.href)
          );
          const selfActive = item.href ? isSectionActive(item.href) : false;
          const active = selfActive || childActive;
          const isOpen = openMenus[item.name] || childActive;

          if (hasChildren) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.name)}
                  className={`flex min-h-[58px] w-full items-center transition-colors ${
                    collapsed ? "justify-center px-0" : "gap-4 px-6"
                  } ${
                    active
                      ? "bg-[#eef1f7] text-primary"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-7 w-7 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">
                        {item.name}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="pb-2">
                    {item.children!.map((child) => {
                      const childIsActive = isExactActive(child.href);

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`ml-16 mt-1 block px-4 py-2 text-[14px] transition-colors ${
                            childIsActive
                              ? "bg-white text-primary"
                              : "text-white hover:text-white/90"
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              title={collapsed ? item.name : undefined}
              className={`flex min-h-[58px] items-center transition-colors ${
                collapsed ? "justify-center px-0" : "gap-4 px-6"
              } ${
                active
                  ? "bg-[#eef1f7] text-primary"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-7 w-7 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 px-6 py-5 text-sm text-white">
          <p className="mb-2">Time:</p>
          <div className="w-fit bg-white px-4 py-2 text-black">2:15:35 P.M.</div>
        </div>
      )}
    </aside>
  );
}