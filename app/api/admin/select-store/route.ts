import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json().catch(() => null)
        const storeId = body?.storeId as string | undefined
        if (!storeId) {
            return NextResponse.json({ error: 'storeId is required' }, { status: 400 })
        }

        const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: session.user.id } })
        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        const cookieStore = cookies()
            ; (await cookieStore).set('activeStoreId', store.id, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
            })

        return NextResponse.json({ success: true, storeId: store.id })
    } catch (error) {
        console.error('select-store error', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
