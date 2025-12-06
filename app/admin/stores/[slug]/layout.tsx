import { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { SidebarInset } from '@/components/ui/sidebar'
import { AdminNav } from '@/components/admin/admin-nav'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ActiveStoreClient } from '../active-store-client'

interface StoreLayoutProps {
    children: ReactNode
    params: { slug: string }
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
        redirect('/login-admin')
    }

    const store = await prisma.store.findFirst({ where: { slug: params.slug, ownerId: session.user.id } })

    if (!store) {
        notFound()
    }

    const cookieStore = await cookies()
    const currentActiveStoreId = cookieStore.get('activeStoreId')?.value

    return (
        <>
            <ActiveStoreClient storeId={store.id} currentActiveStoreId={currentActiveStoreId} />
            <AdminNav />
            <SidebarInset>
                {children}
            </SidebarInset>
        </>
    )
}
