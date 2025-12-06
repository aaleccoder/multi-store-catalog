'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    DollarSign,
    FolderTree,
    LogOut,
    ImageIcon,
    Users,
    Settings,
    Store,
    Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import LogoProps from '../layout/logo'
import { authClient } from '@/lib/auth-client'
import { Role } from '@/generated/prisma/enums'

export function AdminNav() {
    const pathname = usePathname()
    const { data: session } = authClient.useSession()
    const router = useRouter()

    const segments = pathname.split('/').filter(Boolean)
    // Expected paths: /admin/stores (segments: [admin, stores]) or /admin/stores/[slug]/...
    const storeSlug = segments[0] === 'admin' && segments[1] === 'stores' ? segments[2] : null
    const storeBase = storeSlug ? `/admin/stores/${storeSlug}` : '/admin/stores'

    const navigation = [
        { name: 'Panel de Control', href: storeSlug ? storeBase : '/admin/stores', icon: LayoutDashboard, exact: true },
        { name: 'Tiendas', href: '/admin/stores', icon: Store, exact: true },
        { name: 'Productos', href: storeSlug ? `${storeBase}/products` : '/admin/stores', icon: Package },
        { name: 'Categorías', href: storeSlug ? `${storeBase}/categories` : '/admin/stores', icon: FolderTree },
        { name: 'Subcategorías', href: storeSlug ? `${storeBase}/subcategories` : '/admin/stores', icon: FolderTree },
        { name: 'Media', href: storeSlug ? `${storeBase}/media` : '/admin/stores', icon: ImageIcon },
        { name: 'Monedas', href: storeSlug ? `${storeBase}/currencies` : '/admin/stores', icon: DollarSign },
        { name: 'Tema', href: storeSlug ? `${storeBase}/theme` : '/admin/stores', icon: Palette },
    ]

    const adminNavigation = [
        { name: 'Users', href: storeSlug ? `${storeBase}/users` : '/admin/stores', icon: Users },
        { name: 'Configuración', href: storeSlug ? `${storeBase}/settings` : '/admin/stores', icon: Settings },
    ]

    const handleLogout = async () => {
        await authClient.signOut();
        router.push('/login-admin')
    }

    const isActivePath = (href: string, exact?: boolean) => {
        const cleanHref = href.split('?')[0]
        if (exact) return pathname === cleanHref
        return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`)
    }

    return (
        <>
            {/* Mobile header: we keep a small top bar with a trigger for mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Panel de Tiendas</h1>
                    <SidebarTrigger />
                </div>
            </div>

            <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
                <SidebarHeader className="">
                    <button
                        onClick={() => router.push('/')}
                        className="shrink-0 cursor-pointer"
                        aria-label="Ir a inicio"
                    >
                        <LogoProps
                            className="h-16 w-16 md:h-24 md:w-24 text-[#c90606]"
                            aria-label="Logo de Lea Catalog"
                        />
                    </button>
                </SidebarHeader>

                <SidebarContent className='px-4'>
                    <SidebarMenu>
                        {navigation.map((item) => {
                            const isActive = isActivePath(item.href, item.exact)

                            return (
                                <SidebarMenuItem key={item.name} className=''>
                                    <SidebarMenuButton asChild isActive={isActive} className='h-12 text-xl'>
                                        <Link href={item.href} className="flex items-center gap-3 w-full">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        {session?.user?.role === Role.ADMIN && adminNavigation.map((item) => {
                            const isActive = isActivePath(item.href)

                            return (
                                <SidebarMenuItem key={item.name} className=''>
                                    <SidebarMenuButton asChild isActive={isActive} className='h-12 text-xl'>
                                        <Link href={item.href} className="flex items-center gap-3 w-full">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarFooter className="p-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        <span>Cerrar Sesión</span>
                    </Button>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}
