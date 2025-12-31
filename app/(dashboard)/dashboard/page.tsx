import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome, Yaya Wihardi, S.Kom., M.Kom.</h1>
        <p className="text-slate-500 font-medium">Current Date: Januari, 2025</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-slate-800">Course Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Current Subject"
            value="Computer Vision"
            icon={<BookOpen className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Total Enrolled Students"
            value="40 Students"
            icon={<Users className="h-6 w-6 text-emerald-600" />}
          />
        </div>
      </div>

      <footer className="pt-24 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 border-t border-slate-200">
        <p>© 2025 UPI. All rights reserved.</p>
        <p>
          For assistance, contact <span className="text-slate-600 font-medium">support@upi.edu</span>
        </p>
      </footer>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  status,
}: { title: string; value: string; icon: React.ReactNode; status?: "success" }) {
  return (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span
          className={cn(
            "text-2xl font-bold tracking-tight",
            status === "success" ? "text-emerald-600" : "text-slate-900",
          )}
        >
          {value}
        </span>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
