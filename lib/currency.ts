import { prisma } from './db'
import type { Currency } from './currency-client'
export type { Currency } from './currency-client'

const CACHE_DURATION = 60000 // 1 minute
const currencyCache = new Map<string, { currencies: Currency[]; cacheTime: number }>()

export async function getCurrencies(storeId: string): Promise<Currency[]> {
    const now = Date.now()
    const cached = currencyCache.get(storeId)
    if (cached && now - cached.cacheTime < CACHE_DURATION) {
        return cached.currencies
    }

    const currencies = await prisma.currency.findMany({
        where: { isActive: true, storeId },
        orderBy: { code: 'asc' },
    })

    currencyCache.set(storeId, { currencies, cacheTime: now })
    return currencies
}

export async function getCurrencyById(id: string): Promise<Currency | null> {
    return await prisma.currency.findUnique({
        where: { id },
    })
}

export async function getDefaultCurrency(storeId: string): Promise<Currency | null> {
    const currencies = await getCurrencies(storeId)
    return currencies[0] || null
}

// Re-export formatPrice from client-safe module
export { formatPrice } from './currency-client'