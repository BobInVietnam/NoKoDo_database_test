"use client";
import { BookUser, UserRound, School, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../app/(pages)/pages.css";

export default function Sidebar() {
  const pathname = usePathname();
  const menu = [
    {
      href: "/dashboard",
      tooltip: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/user",
      tooltip: "Người dùng",
      icon: UserRound,
    },
    {
      href: "/classes",
      tooltip: "Danh sách lớp học",
      icon: School,
    },
    {
      href: "/lessons",
      tooltip: "Quản lý bài học",
      icon: BookUser,
    },
  ];
  return (
    <div className="sidebar">
      {menu.map((item, i) => {
        const IconComponent = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={i}
            href={item.href}
            data-tooltip={item.tooltip}
            className={`icon ${isActive ? "active" : ""}`}
          >
            <IconComponent size={40} />
          </Link>
        );
      })}
    </div>
  );
}
