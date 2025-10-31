import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  if (typeof window !== "undefined") {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        // Clear session
        await supabaseClient?.auth.signOut()
      }
    })

    // Try to refresh session, but don't throw if it fails
    supabaseClient.auth.refreshSession().catch((error) => {
      console.log("[v0] Session refresh error (expected if no valid session):", error.message)
      // Clear invalid session
      if (typeof window !== "undefined") {
        localStorage.removeItem("sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0] + "-auth-token")
      }
    })
  }

  return supabaseClient
}
