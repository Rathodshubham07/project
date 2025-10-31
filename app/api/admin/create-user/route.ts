import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, role, roll_number, department, semester, specialization } = body

    // Verify admin user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Ignore errors in Server Components
            }
          },
        },
      },
    )

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Create auth user
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("User creation failed")

    // Create user record with service role (bypasses RLS)
    const { error: userError } = await serviceClient.from("users").insert({
      id: authData.user.id,
      email,
      full_name,
      role,
    })

    if (userError) throw userError

    // Create role-specific record
    if (role === "student") {
      const { error: studentError } = await serviceClient.from("students").insert({
        user_id: authData.user.id,
        roll_number,
        department,
        semester: Number.parseInt(semester),
      })
      if (studentError) throw studentError
    } else if (role === "teacher") {
      const { error: teacherError } = await serviceClient.from("teachers").insert({
        user_id: authData.user.id,
        department,
        specialization,
      })
      if (teacherError) throw teacherError
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 400 },
    )
  }
}
