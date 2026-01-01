"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { CameraProvider } from "./CameraContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CameraProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </CameraProvider>
  )
}
