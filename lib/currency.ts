import { prisma } from './db'
import type { Currency } from './currency-client'
export type { Currency } from './currency-client'

let cachedCurrencies: Currency[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60000 // 1 minute

export async function getCurrencies(): Promise<Currency[]> {
    const now = Date.now()
    if (cachedCurrencies && now - cacheTime < CACHE_DURATION) {
        return cachedCurrencies
    }

    const currencies = await prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
    })

    cachedCurrencies = currencies
    cacheTime = now
    return currencies
}

export async function getCurrencyById(id: string): Promise<Currency | null> {
    return await prisma.currency.findUnique({
        where: { id },
    })
}

export async function getDefaultCurrency(): Promise<Currency | null> {
    const currencies = await getCurrencies()
    return currencies[0] || null
}

// Re-export formatPrice from client-safe module
export { formatPrice } from './currency-client'