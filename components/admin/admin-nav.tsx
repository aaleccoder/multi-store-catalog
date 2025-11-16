'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    DollarSign,
    FolderTree,
    LogOut,
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
import LeaLogo from '../lea-logo'
import router from 'next/router'
// `cn` helper intentionally not used here — removed to silence lint.

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Currencies', href: '/admin/currencies', icon: DollarSign },
    { name: 'Subcategories', href: '/admin/subcategories', icon: FolderTree },
]
export function AdminNav() {
    const pathname = usePathname()

    const handleLogout = async () => {
        // Implement logout
        window.location.href = '/api/auth/sign-out'
    }

    return (
        <>
            {/* Mobile header: we keep a small top bar with a trigger for mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <SidebarTrigger />
                </div>
            </div>

            <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
                <SidebarHeader className="">
                    <button
                        onClick={() => router.push('/')}
                        className="flex-shrink-0 cursor-pointer"
                        aria-label="Ir a inicio"
                    >
                        <LeaLogo
                            className="h-16 w-16 md:h-24 md:w-24 text-[#c90606]"
                            aria-label="Lea Catalog logo"
                        />
                    </button>
                </SidebarHeader>

                <SidebarContent className='px-4'>
                    <SidebarMenu>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href

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
                        <span>Logout</span>
                    </Button>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}
