import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all students with their details
    const { data: students } = await supabase
      .from("students")
      .select(`
        id,
        roll_number,
        department,
        semester,
        user:users(full_name, email)
      `)
      .order("roll_number")

    if (!students) {
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    // Format response for n8n
    const formattedStudents = students.map((student: any) => ({
      id: student.id,
      rollNumber: student.roll_number,
      name: student.user?.full_name,
      email: student.user?.email,
      department: student.department,
      semester: student.semester,
    }))

    return NextResponse.json({
      success: true,
      count: formattedStudents.length,
      students: formattedStudents,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
