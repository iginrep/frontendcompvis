"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Monitor, History, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Monitor", href: "/monitor", icon: Monitor },
  { name: "History", href: "/history", icon: History },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">SmartPresence AI</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/login"
          className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Logout
        </Link>
      </div>
    </div>
  )
}
