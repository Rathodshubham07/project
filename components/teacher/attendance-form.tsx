"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Student {
  id: string
  roll_number: string
  user: {
    full_name: string
  }
}

interface AttendanceFormProps {
  classId: string
  className: string
  onSuccess: () => void
}

export function AttendanceForm({ classId, className, onSuccess }: AttendanceFormProps) {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("")
  const [useN8n, setUseN8n] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: studentsData } = await supabase.from("students").select(`
            id,
            roll_number,
            user:users(full_name)
          `)

        if (studentsData) {
          setStudents(studentsData as any)
          const initialAttendance: Record<string, boolean> = {}
          studentsData.forEach((student: any) => {
            initialAttendance[student.id] = true
          })
          setAttendance(initialAttendance)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (useN8n && n8nWebhookUrl) {
        // Send to n8n webhook
        const attendanceData = students.map((student) => ({
          rollNumber: student.roll_number,
          status: attendance[student.id] ? "present" : "absent",
        }))

        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId,
            date,
            students: attendanceData,
          }),
        })

        if (!response.ok) throw new Error("N8N webhook failed")
      } else {
        // Save directly to database
        const attendanceRecords = students.map((student) => ({
          class_id: classId,
          student_id: student.id,
          date,
          status: attendance[student.id] ? "present" : "absent",
        }))

        const { error } = await supabase.from("attendance_records").upsert(attendanceRecords, {
          onConflict: "class_id,student_id,date",
        })

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error("Error submitting attendance:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading students...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox id="use-n8n" checked={useN8n} onCheckedChange={(checked) => setUseN8n(checked as boolean)} />
        <Label htmlFor="use-n8n" className="cursor-pointer flex-1">
          Use N8N Webhook
        </Label>
      </div>

      {useN8n && (
        <div className="space-y-2">
          <Label htmlFor="n8n-url">N8N Webhook URL</Label>
          <Input
            id="n8n-url"
            placeholder="https://your-n8n-instance.com/webhook/..."
            value={n8nWebhookUrl}
            onChange={(e) => setN8nWebhookUrl(e.target.value)}
            required={useN8n}
          />
          <p className="text-xs text-gray-500">Leave empty to save directly to database</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
        <p className="font-medium text-sm">Mark attendance (checked = present)</p>
        {students.map((student) => (
          <div key={student.id} className="flex items-center space-x-2">
            <Checkbox
              id={student.id}
              checked={attendance[student.id] || false}
              onCheckedChange={(checked) => setAttendance({ ...attendance, [student.id]: checked })}
            />
            <Label htmlFor={student.id} className="cursor-pointer flex-1">
              {student.roll_number} - {student.user?.full_name}
            </Label>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Attendance"}
      </Button>
    </form>
  )
}
