import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      },
    )

    // Fetch all data using service role (bypasses RLS)
    const [usersResult, studentsResult, teachersResult] = await Promise.all([
      adminSupabase.from("users").select("*"),
      adminSupabase.from("students").select(`
        id,
        roll_number,
        department,
        user:users(id, email, full_name, role, created_at)
      `),
      adminSupabase.from("teachers").select(`
        id,
        department,
        specialization,
        user:users(id, email, full_name, role, created_at)
      `),
    ])

    return NextResponse.json({
      users: usersResult.data || [],
      students: studentsResult.data || [],
      teachers: teachersResult.data || [],
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
