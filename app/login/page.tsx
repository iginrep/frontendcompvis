import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-6 w-6 text-slate-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SmartPresence Login</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
        <div className="text-center space-y-4 max-w-lg">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">Welcome Back!</h1>
          <p className="text-slate-500 font-medium text-lg">
            Log in to your SmartPresence account to access all features.
          </p>
        </div>

        <div className="w-full max-w-4xl space-y-12">
          <Card className="border-none shadow-none bg-transparent max-w-2xl mx-auto">
            <CardContent className="p-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-900">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-14 rounded-xl bg-white border-slate-200 shadow-sm text-lg px-6"
                  />
                  <p className="text-xs text-slate-400 font-medium">We'll never share your email.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-900">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-14 rounded-xl bg-white border-slate-200 shadow-sm text-lg px-6"
                  />
                  <p className="text-xs text-slate-400 font-medium">Keep it safe!</p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Link href="/dashboard" className="w-full md:w-auto">
                  <Button className="w-full md:w-auto bg-slate-950 text-white rounded-2xl px-24 py-5 h-auto text-lg font-bold shadow-2xl hover:bg-slate-800 transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
