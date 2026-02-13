import { formatPrice } from '@/lib/currency-client'
import { type Currency } from '@/lib/currency-client'
import { type StoreBranding } from '@/lib/theme'

export interface WhatsAppItem {
    name: string
    quantity: number
    price: number
    currency?: Currency | string | null
    variantName?: string
}

export interface ActiveStoreWhatsAppData extends Pick<StoreBranding, 'contactPhone' | 'contactEmail' | 'contactAddress' | 'slogan'> {
    name?: string | null
}

const normalizeWhatsAppPhone = (phoneNumber?: string | null) => {
    const normalized = (phoneNumber ?? '').replace(/[^\d]/g, '')
    return normalized || null
}

export function generateWhatsAppLink(
    items: WhatsAppItem[],
    total: number,
    currency?: Currency | string | null,
    activeStore?: ActiveStoreWhatsAppData | null
) {
    const phoneNumber = normalizeWhatsAppPhone(activeStore?.contactPhone)
    const storeName = activeStore?.name?.trim()
    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n'

    if (storeName) {
        message = `¡Hola! Me gustaría hacer el siguiente pedido en ${storeName}:\n\n`
    }

    items.forEach((item, index) => {
        const itemName = item.variantName ? `${item.name} (${item.variantName})` : item.name
        message += `${index + 1}. ${itemName}\n`
        message += `   Cantidad: ${item.quantity}\n`
        message += `   Precio: ${formatPrice(item.price, item.currency || currency)}\n`
        message += `   Subtotal: ${formatPrice(item.price * item.quantity, item.currency || currency)}\n\n`
    })

    message += `\n*Total: ${formatPrice(total, currency)}*\n\n`
    message += 'Gracias!'

    const encodedMessage = encodeURIComponent(message)
    const baseUrl = phoneNumber ? `https://wa.me/${phoneNumber}` : 'https://wa.me/'
    return `${baseUrl}?text=${encodedMessage}`
}

export function openWhatsApp(
    items: WhatsAppItem[],
    total: number,
    currency?: Currency | string | null,
    activeStore?: ActiveStoreWhatsAppData | null
) {
    const url = generateWhatsAppLink(items, total, currency, activeStore)
    window.open(url, '_blank')
}
