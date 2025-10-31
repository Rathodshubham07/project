import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"

export default async function StudentProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/")
  }

  // Use email-based role detection instead
  const role = user.email?.includes("student") ? "student" : null
  const fullName = user.email?.split("@")[0] || "Student"

  if (role !== "student") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="student" userName={fullName} />
      <div className="max-w-6xl mx-auto p-6">
        <p>Profile page - redirects to dashboard</p>
      </div>
    </div>
  )
}
