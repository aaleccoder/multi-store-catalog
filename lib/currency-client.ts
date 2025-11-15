// Client-safe currency formatting utilities
// This file doesn't import Prisma and can be used in client components

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

export function formatPrice(
    amount: number,
    currency?: Currency | string | null,
): string {
    if (!currency) {
        return `$${amount.toFixed(2)}`
    }

    // If currency is a string (ID), use default formatting
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
