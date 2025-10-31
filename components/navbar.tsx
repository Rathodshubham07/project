"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  userRole: "student" | "teacher" | "admin"
  userName?: string
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const dashboardLink = {
    student: "/student/dashboard",
    teacher: "/teacher/dashboard",
    admin: "/admin/dashboard",
  }[userRole]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={dashboardLink} className="font-bold text-xl text-blue-600">
            Attendance System
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 capitalize">{userName && `${userName} (${userRole})`}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
