import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
    try {
        const userCount = await prisma.user.count()
        if (userCount > 0) {
            return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
        }

        const body = await req.json()
        const { email, password, name } = body

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // Create user using better-auth
        // We pass headers to allow better-auth to handle context if needed
        const ctx = await headers()

        try {
            await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name
                },
                headers: ctx
            })
        } catch (e) {
            // If it fails, it might be because of validation or other issues
            console.error("Better auth signup failed", e)
            return NextResponse.json({ error: 'Failed to create user via auth provider' }, { status: 500 })
        }

        // Update role to ADMIN
        const user = await prisma.user.findUnique({ where: { email } })

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            })
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: 'User created but not found' }, { status: 500 })
        }

    } catch (error: any) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
