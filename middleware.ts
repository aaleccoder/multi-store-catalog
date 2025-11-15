import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        // Check for session cookie from better-auth
        const sessionToken = request.cookies.get('better-auth.session_token')

        // Allow login page
        if (pathname === '/admin/login') {
            // If already logged in, redirect to admin dashboard
            if (sessionToken) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            return NextResponse.next()
        }

        // Redirect to login if no session
        if (!sessionToken) {
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
