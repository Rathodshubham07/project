"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<any[]>([])

  const handleSetup = async () => {
    setLoading(true)
    setMessage("Setting up demo accounts...")
    setResults([])

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setMessage("✓ Demo accounts created successfully!")
        setResults(data.results)
      } else {
        setMessage(`✗ Setup failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">College Attendance System</CardTitle>
          <CardDescription>Setup Demo Accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              <p className="font-semibold mb-2">⚠️ Important: Database Setup Required</p>
              <p className="text-sm mb-3">
                Before creating demo accounts, you must run the database fix script in your Supabase SQL editor:
              </p>
              <ol className="text-sm space-y-2 ml-4 list-decimal">
                <li>Go to your Supabase dashboard → SQL Editor</li>
                <li>
                  Copy and paste the contents of{" "}
                  <code className="bg-white px-2 py-1 rounded font-mono">scripts/011_complete_fix.sql</code>
                </li>
                <li>Click "Run" to execute the script</li>
                <li>Come back here and click "Create Demo Accounts"</li>
              </ol>
              <p className="text-xs mt-3 text-blue-800">
                This script disables RLS policies that were causing infinite recursion errors and removes old demo
                accounts.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-semibold">Demo Account Credentials:</p>

            <div className="grid gap-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">Student Account</p>
                <p className="text-sm text-blue-700">
                  Email: <code className="bg-white px-2 py-1 rounded font-mono">student@demo.com</code>
                </p>
                <p className="text-sm text-blue-700">
                  Password: <code className="bg-white px-2 py-1 rounded font-mono">demo123456</code>
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-900">Teacher Account</p>
                <p className="text-sm text-green-700">
                  Email: <code className="bg-white px-2 py-1 rounded font-mono">teacher@demo.com</code>
                </p>
                <p className="text-sm text-green-700">
                  Password: <code className="bg-white px-2 py-1 rounded font-mono">demo123456</code>
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium text-purple-900">Admin Account</p>
                <p className="text-sm text-purple-700">
                  Email: <code className="bg-white px-2 py-1 rounded font-mono">admin@college.local</code>
                </p>
                <p className="text-sm text-purple-700">
                  Password: <code className="bg-white px-2 py-1 rounded font-mono">admin123456</code>
                </p>
              </div>
            </div>

            <Button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Setting up..." : "Create Demo Accounts"}
            </Button>

            {message && (
              <div
                className={`p-4 rounded text-sm ${
                  message.includes("✓")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Setup Results:</p>
                {results.map((result, idx) => (
                  <div key={idx} className="text-sm p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-medium text-gray-900">{result.email}</p>
                    <p className={result.status === "success" ? "text-green-600" : "text-red-600"}>{result.message}</p>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
