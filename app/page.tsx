"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [showLogin, setShowLogin] = useState(true)
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setupMessage, setSetupMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First, try to set up demo accounts
        console.log("[v0] Initializing demo accounts...")
        const setupResponse = await fetch("/api/auto-setup")
        if (setupResponse.ok) {
          const data = await setupResponse.json()
          console.log("[v0] Auto-setup completed:", data)
          setSetupMessage("Demo accounts ready!")
          setTimeout(() => setSetupMessage(null), 3000)
        } else {
          console.log("[v0] Auto-setup response not ok:", setupResponse.status)
        }
      } catch (error) {
        console.log("[v0] Auto-setup error:", error)
      }

      // Then check if user is already logged in
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.log("[v0] Get user error (expected if not logged in):", userError.message)
          return
        }

        if (user) {
          console.log("[v0] User already logged in, redirecting...")
          if (user.email?.includes("admin")) {
            router.push("/admin/dashboard")
          } else if (user.email?.includes("teacher")) {
            router.push("/teacher/dashboard")
          } else {
            router.push("/student/dashboard")
          }
        }
      } catch (error) {
        console.log("[v0] Check user error:", error instanceof Error ? error.message : "Unknown error")
        // Continue - user is not logged in
      }
    }

    initializeApp()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userRole) {
      setError("Please select a role")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.log("[v0] Auth error:", authError.message)
        throw new Error(authError.message || "Authentication failed")
      }

      if (userRole === "student") {
        router.push("/student/dashboard")
      } else if (userRole === "teacher") {
        router.push("/teacher/dashboard")
      } else if (userRole === "admin") {
        router.push("/admin/dashboard")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      console.log("[v0] Login error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role: "student" | "teacher" | "admin") => {
    setUserRole(role)
    const demoCredentials: Record<string, { email: string; password: string }> = {
      student: { email: "student@demo.com", password: "demo123456" },
      teacher: { email: "teacher@demo.com", password: "demo123456" },
      admin: { email: "admin@college.local", password: "admin123456" },
    }

    const creds = demoCredentials[role]
    setEmail(creds.email)
    setPassword(creds.password)

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting demo login for:", role)

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      })

      if (authError) {
        console.log("[v0] Demo auth error:", authError.message)
        throw new Error(authError.message || "Demo login failed")
      }

      console.log("[v0] Demo auth successful, redirecting...")

      if (role === "student") {
        router.push("/student/dashboard")
      } else if (role === "teacher") {
        router.push("/teacher/dashboard")
      } else if (role === "admin") {
        router.push("/admin/dashboard")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Demo login failed"
      console.log("[v0] Demo login error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-2">College Attendance System</CardTitle>
            <CardDescription className="text-lg">Manage and track student attendance efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">For Students</h3>
                <p className="text-sm text-blue-700 mb-4">View your attendance records and profile</p>
                <Button onClick={() => handleDemoLogin("student")} className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Student Login"}
                </Button>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">For Teachers</h3>
                <p className="text-sm text-green-700 mb-4">Mark attendance and manage classes</p>
                <Button onClick={() => handleDemoLogin("teacher")} className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Teacher Login"}
                </Button>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">For Admins</h3>
                <p className="text-sm text-purple-700 mb-4">Manage all users and data</p>
                <Button onClick={() => handleDemoLogin("admin")} className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Admin Login"}
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowLogin(true)} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">College Attendance</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {setupMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              {setupMessage}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Tabs value={userRole || ""} onValueChange={(v) => setUserRole(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || !userRole}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-gray-600 mb-3">Try Demo Accounts</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("student")}
                className="w-full text-xs"
                disabled={isLoading}
              >
                Demo: Student (student@demo.com / demo123456)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("teacher")}
                className="w-full text-xs"
                disabled={isLoading}
              >
                Demo: Teacher (teacher@demo.com / demo123456)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("admin")}
                className="w-full text-xs"
                disabled={isLoading}
              >
                Demo: Admin (admin@college.local / admin123456)
              </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={() => setShowLogin(false)} className="w-full mt-4">
            View All Options
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
