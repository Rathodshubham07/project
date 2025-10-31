import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseServerClient: ReturnType<typeof createSupabaseClient> | null = null

export async function createClient() {
  if (supabaseServerClient) {
    return supabaseServerClient
  }

  supabaseServerClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  return supabaseServerClient
}
