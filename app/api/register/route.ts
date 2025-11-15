import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Use Better Auth's sign up API
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: name || email.split('@')[0],
            },
            headers: {
                'content-type': 'application/json'
            }
        })

        return NextResponse.json({
            success: true,
            user: result.user,
            message: 'User registered successfully'
        })

    } catch (error: unknown) {
        console.error('Registration error:', error)

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage.includes('already exists') || errorMessage.includes('unique constraint')) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: `Failed to register user: ${errorMessage}` },
            { status: 500 }
        )
    }
}