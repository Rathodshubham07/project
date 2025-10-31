"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddClassFormProps {
  teacherId: string
  onSuccess: () => void
}

export function AddClassForm({ teacherId, onSuccess }: AddClassFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    class_name: "",
    subject: "",
    semester: "",
    schedule: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("classes").insert({
        teacher_id: teacherId,
        class_name: formData.class_name,
        subject: formData.subject,
        semester: Number.parseInt(formData.semester),
        schedule: formData.schedule,
      })

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error("Error adding class:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="class_name">Class Name</Label>
        <Input
          id="class_name"
          placeholder="e.g., CS-101"
          value={formData.class_name}
          onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="e.g., Data Structures"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester">Semester</Label>
        <Input
          id="semester"
          type="number"
          placeholder="e.g., 3"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule">Schedule</Label>
        <Input
          id="schedule"
          placeholder="e.g., Mon, Wed 10:00 AM"
          value={formData.schedule}
          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Class"}
      </Button>
    </form>
  )
}
