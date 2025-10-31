import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Expected webhook payload from n8n:
    // {
    //   classId: string,
    //   date: string,
    //   students: [
    //     { rollNumber: string, status: 'present' | 'absent' }
    //   ]
    // }

    const { classId, date, students } = body

    if (!classId || !date || !students || !Array.isArray(students)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Get all students and their IDs
    const { data: allStudents } = await supabase.from("students").select("id, roll_number")

    if (!allStudents) {
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    // Map roll numbers to student IDs
    const rollNumberToId: Record<string, string> = {}
    allStudents.forEach((student: any) => {
      rollNumberToId[student.roll_number] = student.id
    })

    // Prepare attendance records
    const attendanceRecords = students
      .map((student: any) => {
        const studentId = rollNumberToId[student.rollNumber]
        if (!studentId) return null

        return {
          class_id: classId,
          student_id: studentId,
          date,
          status: student.status,
        }
      })
      .filter(Boolean)

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ error: "No valid students found" }, { status: 400 })
    }

    // Upsert attendance records
    const { error } = await supabase.from("attendance_records").upsert(attendanceRecords, {
      onConflict: "class_id,student_id,date",
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${attendanceRecords.length} students`,
      recordsCount: attendanceRecords.length,
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return webhook info for testing
  return NextResponse.json({
    webhook: "N8N Attendance Webhook",
    endpoint: "/api/n8n/webhook",
    method: "POST",
    expectedPayload: {
      classId: "uuid",
      date: "YYYY-MM-DD",
      students: [
        {
          rollNumber: "string",
          status: "present | absent",
        },
      ],
    },
  })
}
