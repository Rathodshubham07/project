"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { AttendanceForm } from "./attendance-form"
import { AddClassForm } from "./add-class-form" // Added import for AddClassForm

interface TeacherProfile {
  id: string
  department: string
  specialization: string
  phone: string
  office_location: string
}

interface Class {
  id: string
  class_name: string
  subject: string
  semester: number
  schedule: string
}

export function TeacherDashboardContent({ userId }: { userId: string }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editData, setEditData] = useState<Partial<TeacherProfile>>({})
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher profile
        const { data: teacherData } = await supabase.from("teachers").select("*").eq("user_id", userId).single()

        if (teacherData) {
          setProfile(teacherData)
          setEditData(teacherData)

          // Fetch classes
          const { data: classesData } = await supabase.from("classes").select("*").eq("teacher_id", teacherData.id)

          if (classesData) {
            setClasses(classesData)
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
      const { error } = await supabase.from("teachers").update(editData).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editData })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Classes</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                  </DialogHeader>
                  <AddClassForm
                    teacherId={profile?.id || ""}
                    onSuccess={() => {
                      // Refresh classes
                      window.location.reload()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <Card key={cls.id}>
                  <CardHeader>
                    <CardTitle>{cls.class_name}</CardTitle>
                    <CardDescription>{cls.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Semester:</span> {cls.semester}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Schedule:</span> {cls.schedule}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedClass(cls)}>
                          Mark Attendance
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Mark Attendance - {cls.subject}</DialogTitle>
                        </DialogHeader>
                        {selectedClass && (
                          <AttendanceForm
                            classId={selectedClass.id}
                            className={selectedClass.class_name}
                            onSuccess={() => {
                              // Refresh or close dialog
                              window.location.reload()
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>

            {classes.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No classes yet. Create one to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={editData.department || ""}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input
                        value={editData.specialization || ""}
                        onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
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
                    <div className="space-y-2">
                      <Label>Office Location</Label>
                      <Input
                        value={editData.office_location || ""}
                        onChange={(e) => setEditData({ ...editData, office_location: e.target.value })}
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
