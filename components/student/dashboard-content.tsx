"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"

interface StudentProfile {
  id: string
  roll_number: string
  department: string
  semester: number
  phone: string
  address: string
}

interface AttendanceRecord {
  id: string
  date: string
  status: "present" | "absent"
  class: {
    class_name: string
    subject: string
  }
}

export function StudentDashboardContent({ userId }: { userId: string }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editData, setEditData] = useState<Partial<StudentProfile>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student profile
        const { data: studentData } = await supabase.from("students").select("*").eq("user_id", userId).single()

        if (studentData) {
          setProfile(studentData)
          setEditData(studentData)
        }

        // Fetch attendance records
        if (studentData) {
          const { data: attendanceData } = await supabase
            .from("attendance_records")
            .select(`
              id,
              date,
              status,
              class:classes(class_name, subject)
            `)
            .eq("student_id", studentData.id)
            .order("date", { ascending: false })

          if (attendanceData) {
            setAttendance(attendanceData as any)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, supabase])

  const handleUpdateProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase.from("students").update(editData).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editData })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const presentCount = attendance.filter((a) => a.status === "present").length
  const absentCount = attendance.filter((a) => a.status === "absent").length
  const attendancePercentage = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attendance.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Your attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendance.length === 0 ? (
                  <p className="text-gray-500">No attendance records yet</p>
                ) : (
                  attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{record.class.subject}</p>
                        <p className="text-sm text-gray-600">{record.class.class_name}</p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.status === "present" ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Absent</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Roll Number</Label>
                      <Input value={profile.roll_number} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={editData.department || ""}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Input
                        type="number"
                        value={editData.semester || ""}
                        onChange={(e) => setEditData({ ...editData, semester: Number.parseInt(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone || ""}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={editData.address || ""}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                      <>
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setEditData(profile)
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
