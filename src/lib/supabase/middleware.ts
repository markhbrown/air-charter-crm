import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and keeps the auth
 * cookies in sync between the browser and the server. Called from
 * `src/middleware.ts`. This is required for Server Components to read a
 * valid session.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run any code between `createServerClient` and
  // `getUser()`. A simple mistake here can make it very hard to debug
  // intermittent logouts. `getUser()` revalidates the token with the Supabase
  // Auth server (unlike `getSession()`), so it is the safe call to gate on.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login";

  // Unauthenticated users may only reach the login page.
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Signed-in users shouldn't see the login page.
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Return `supabaseResponse` as-is. If you create a new response,
  // copy over `supabaseResponse.cookies` or the session will not persist.
  return supabaseResponse;
}
