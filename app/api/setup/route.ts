import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
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
        password: "admin123456", // Updated to meet 6+ character requirement
        role: "admin",
        full_name: "Admin User",
      },
    ]

    const results = []

    for (const account of demoAccounts) {
      try {
        // Sign up user using admin client
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
            message: "User creation failed",
          })
          continue
        }

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
          await supabaseAdmin.from("students").insert({
            user_id: authData.user.id,
            roll_number: account.roll_number,
            department: "Computer Science",
            semester: 1,
          })
        }

        // If teacher, create teacher profile
        if (account.role === "teacher") {
          await supabaseAdmin.from("teachers").insert({
            user_id: authData.user.id,
            department: account.department,
            specialization: "General",
          })
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
    console.error("[v0] Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      },
      { status: 500 },
    )
  }
}
