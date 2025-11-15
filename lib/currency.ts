import { prisma } from './db'

export interface Currency {
    id: string
    name: string
    code: string
    symbol: string
    symbolPosition: string
    decimalSeparator: string
    thousandsSeparator: string
    decimalPlaces: number
    isActive: boolean
}

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

export function formatPrice(
    amount: number,
    currency?: Currency | string | null,
): string {
    if (!currency) {
        return `$${amount.toFixed(2)}`
    }

    // If currency is a string (ID), we need to fetch it
    // For now, handle Currency object
    if (typeof currency === 'string') {
        return `$${amount.toFixed(2)}`
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces)
    const parts = formattedAmount.split('.')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
    const decimalPart = parts[1]
    const finalAmount = decimalPart ? `${integerPart}${currency.decimalSeparator}${decimalPart}` : integerPart

    if (currency.symbolPosition === 'before') {
        return `${currency.symbol}${finalAmount}`
    } else {
        return `${finalAmount}${currency.symbol}`
    }
}
