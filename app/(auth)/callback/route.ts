import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile exists for OAuth users (DB trigger may fail silently)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata;
        const username = meta?.username
          || meta?.preferred_username
          || user.email?.split("@")[0]
          || `user_${user.id.slice(0, 8)}`;

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            display_name: meta?.full_name || meta?.name || username,
          },
          { onConflict: "id" }
        );
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
