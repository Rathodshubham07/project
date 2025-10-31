import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { TeacherDashboardContent } from "@/components/teacher/dashboard-content"

export default async function TeacherDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  // Use email-based role detection instead
  const role = user.email?.includes("teacher") ? "teacher" : null
  const fullName = user.email?.split("@")[0] || "Teacher"

  if (role !== "teacher") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="teacher" userName={fullName} />
      <TeacherDashboardContent userId={user.id} />
    </div>
  )
}
