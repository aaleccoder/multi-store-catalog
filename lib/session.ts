import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Get the current session from the server side.
 * This function validates the session properly using Better Auth.
 */
export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    return session
}

/**
 * Require authentication for a page.
 * Redirects to login if not authenticated.
 */
export async function requireAuth(redirectTo?: string) {
    const session = await getSession()

    if (!session) {
        const loginUrl = redirectTo ? `/admin/login?from=${redirectTo}` : '/admin/login'
        redirect(loginUrl)
    }

    return session
}

export async function getApiSession(request: Request | import('next/server').NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        return session
    } catch {
        return null
    }
}

export async function requireApiAuth(request: Request | import('next/server').NextRequest) {
    const session = await getApiSession(request)
    return session
}
