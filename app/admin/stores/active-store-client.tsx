'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface ActiveStoreClientProps {
    storeId: string
    currentActiveStoreId?: string
}

export function ActiveStoreClient({ storeId, currentActiveStoreId }: ActiveStoreClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        if (currentActiveStoreId === storeId || isPending) return

        startTransition(() => {
            fetch('/api/admin/select-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId }),
            })
                .then((res) => {
                    if (!res.ok) throw new Error('No se pudo seleccionar la tienda')
                    router.refresh()
                })
                .catch((err) => {
                    console.error('Failed to set active store', err)
                })
        })
    }, [currentActiveStoreId, isPending, router, storeId, startTransition])

    return null
}
