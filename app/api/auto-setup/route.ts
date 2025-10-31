import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] SUPABASE_SERVICE_ROLE_KEY is not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.",
        },
        { status: 500 },
      )
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Demo accounts to create
    const demoAccounts = [
      {
        email: "student@demo.com",
        password: "demo123456",
        role: "student",
        full_name: "Demo Student",
        roll_number: "DEMO001",
      },
      {
        email: "teacher@demo.com",
        password: "demo123456",
        role: "teacher",
        full_name: "Demo Teacher",
        department: "Computer Science",
      },
      {
        email: "admin@college.local",
        password: "admin123456",
        role: "admin",
        full_name: "Admin User",
      },
    ]

    const results = []

    for (const account of demoAccounts) {
      try {
        const { data: existingUsers, error: checkError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", account.email)
          .maybeSingle()

        if (checkError && checkError.code !== "PGRST116") {
          console.log(`[v0] Check error for ${account.email}:`, checkError.message)
        }

        if (existingUsers) {
          console.log(`[v0] User ${account.email} already exists`)
          results.push({
            email: account.email,
            status: "exists",
            message: "Account already exists",
          })
          continue
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        })

        if (authError) {
          console.log(`[v0] Auth error for ${account.email}:`, authError.message)
          results.push({
            email: account.email,
            status: "error",
            message: authError.message,
          })
          continue
        }

        if (!authData.user) {
          results.push({
            email: account.email,
            status: "error",
            message: "User creation failed - no user data returned",
          })
          continue
        }

        console.log(`[v0] Created auth user for ${account.email}`)

        // Create user profile
        const { error: profileError } = await supabaseAdmin.from("users").insert({
          id: authData.user.id,
          email: account.email,
          full_name: account.full_name,
          role: account.role,
        })

        if (profileError) {
          console.log(`[v0] Profile error for ${account.email}:`, profileError.message)
          results.push({
            email: account.email,
            status: "error",
            message: `Profile creation failed: ${profileError.message}`,
          })
          continue
        }

        // If student, create student profile
        if (account.role === "student") {
          const { error: studentError } = await supabaseAdmin.from("students").insert({
            user_id: authData.user.id,
            roll_number: account.roll_number,
            department: "Computer Science",
            semester: 1,
          })
          if (studentError) {
            console.log(`[v0] Student profile error for ${account.email}:`, studentError.message)
          }
        }

        // If teacher, create teacher profile
        if (account.role === "teacher") {
          const { error: teacherError } = await supabaseAdmin.from("teachers").insert({
            user_id: authData.user.id,
            department: account.department,
            specialization: "General",
          })
          if (teacherError) {
            console.log(`[v0] Teacher profile error for ${account.email}:`, teacherError.message)
          }
        }

        results.push({
          email: account.email,
          status: "success",
          message: "Account created successfully",
        })
      } catch (error) {
        console.log(`[v0] Error creating account for ${account.email}:`, error)
        results.push({
          email: account.email,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Setup completed",
      results,
    })
  } catch (error) {
    console.error("[v0] Auto-setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      },
      { status: 500 },
    )
  }
}
