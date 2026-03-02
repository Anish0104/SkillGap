
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Check for environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.json(
            { error: 'Configuration Error', message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local' },
            { status: 500 }
        )
    }

    // Create a Supabase client to refresh the session
    let supabase;
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.trim();
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();

        supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )
    } catch (error: any) {
        console.error('Failed to create Supabase client:', error)
        return NextResponse.json(
            {
                error: 'Configuration Error',
                message: 'Invalid Supabase URL or Key. Please check .env.local',
                details: error?.message || String(error),
                providedUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'starts with ' + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 5) : 'missing'
            },
            { status: 500 }
        )
    }

    // Use getUser instead of getSession for security
    let user = null;
    try {
        console.log(`Checking session for: ${request.nextUrl.pathname}`)
        const { data } = await supabase.auth.getUser()
        user = data.user
        console.log(`User session: ${user ? user.email : 'none'}`)
    } catch (error) {
        console.error('Error getting user in proxy:', error)
    }

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/'
    ) {
        // Basic protection: If not logged in and trying to access protected route (anything not / or /login), redirect
        // Adjust logic as needed. For now, we protect dashboard/*
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export default proxy

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
