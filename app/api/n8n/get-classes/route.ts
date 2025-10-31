import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all classes with teacher info
    const { data: classes } = await supabase
      .from("classes")
      .select(`
        id,
        class_name,
        subject,
        semester,
        schedule,
        teacher:teachers(
          id,
          user:users(full_name, email)
        )
      `)
      .order("class_name")

    if (!classes) {
      return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
    }

    // Format response for n8n
    const formattedClasses = classes.map((cls: any) => ({
      id: cls.id,
      className: cls.class_name,
      subject: cls.subject,
      semester: cls.semester,
      schedule: cls.schedule,
      teacher: {
        id: cls.teacher?.id,
        name: cls.teacher?.user?.full_name,
        email: cls.teacher?.user?.email,
      },
    }))

    return NextResponse.json({
      success: true,
      count: formattedClasses.length,
      classes: formattedClasses,
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
