'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

interface ActiveStoreClientProps {
    storeId: string
    currentActiveStoreId?: string
}

export function ActiveStoreClient({ storeId, currentActiveStoreId }: ActiveStoreClientProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const attemptedStoreIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (currentActiveStoreId === storeId) {
            attemptedStoreIdRef.current = null
            return
        }

        if (attemptedStoreIdRef.current === storeId) return

        attemptedStoreIdRef.current = storeId
        const controller = new AbortController()
        let cancelled = false

        const selectStore = async () => {
            try {
                const res = await fetch('/api/admin/select-store', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storeId }),
                    signal: controller.signal,
                    credentials: 'include',
                })

                if (!res.ok) throw new Error('No se pudo seleccionar la tienda')
                if (cancelled) return

                await queryClient.invalidateQueries()
                router.refresh()
            } catch (err) {
                if (cancelled) return

                console.error('Failed to set active store', err)
                attemptedStoreIdRef.current = null
            }
        }

        selectStore()

        return () => {
            cancelled = true
            controller.abort()
        }
    }, [currentActiveStoreId, queryClient, router, storeId])

    return null
}
