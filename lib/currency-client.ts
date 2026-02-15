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
    let formatted = '';
    const stripTrailingZeros = (value: string) => value.replace(/([.,]00)(?!\d)/, '');

    if (!currency) {
        formatted = `$${amount.toFixed(2)}`
    } else if (typeof currency === 'string') {
        const code = currency.trim().toUpperCase()
        if (/^[A-Z]{3}$/.test(code)) {
            try {
                formatted = new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: code,
                }).format(amount)
            } catch {
                formatted = `$${amount.toFixed(2)}`
            }
        } else {
            // If currency is a store currency ID, use default formatting
            formatted = `$${amount.toFixed(2)}`
        }
    } else {
        const formattedAmount = amount.toFixed(currency.decimalPlaces)
        const parts = formattedAmount.split('.')
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
        const decimalPart = parts[1]
        const finalAmount = decimalPart ? `${integerPart}${currency.decimalSeparator}${decimalPart}` : integerPart

        if (currency.symbolPosition === 'before') {
            formatted = `${currency.symbol}${finalAmount}`
        } else {
            formatted = `${finalAmount}${currency.symbol}`
        }
    }

    // Strip trailing zeros logic
    if (typeof currency === 'object' && currency !== null) {
        if (currency.decimalPlaces > 0) {
            const { decimalSeparator, decimalPlaces } = currency
            const zeros = '0'.repeat(decimalPlaces)
            const target = `${decimalSeparator}${zeros}`
            formatted = formatted.replace(target, '')
        }
    } else {
        formatted = stripTrailingZeros(formatted)
    }

    return formatted
}
