"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  Plane,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: Plane },
];

const adminLink = {
  href: "/dashboard/admin",
  label: "Admin",
  icon: ShieldCheck,
};

export function DashboardNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        // Exact match for Overview, prefix match for the section pages.
        const active =
          href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
