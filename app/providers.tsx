'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/trpc/client'
import { httpBatchLink } from '@trpc/client'
import { Toaster } from '@/components/ui/sonner'

const queryClient = new QueryClient()

const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: '/api/trpc',
        }),
    ],
})

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </trpc.Provider>
    )
}
