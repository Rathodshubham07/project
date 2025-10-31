import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { AdminDashboardContent } from "@/components/admin/dashboard-content"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  const role = user.email?.includes("admin") ? "admin" : null
  const fullName = user.email?.split("@")[0] || "Admin"

  if (role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" userName={fullName} />
      <AdminDashboardContent />
    </div>
  )
}
