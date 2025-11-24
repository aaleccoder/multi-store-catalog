import { formatPrice } from '@/lib/currency-client'
import { type Currency } from '@/lib/currency-client'

export interface WhatsAppItem {
    name: string
    quantity: number
    price: number
    currency?: Currency | string | null
    variantName?: string
}

export function generateWhatsAppLink(items: WhatsAppItem[], total: number, currency?: Currency | string | null) {
    const phoneNumber = '+5355145384'
    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n'

    items.forEach((item, index) => {
        const itemName = item.variantName ? `${item.name} (${item.variantName})` : item.name
        message += `${index + 1}. ${itemName}\n`
        message += `   Cantidad: ${item.quantity}\n`
        message += `   Precio: ${formatPrice(item.price, item.currency || currency)}\n\n`
    })

    message += `\n*Total: ${formatPrice(total, currency)}*\n\n`
    message += 'Gracias!'

    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

export function openWhatsApp(items: WhatsAppItem[], total: number, currency?: Currency | string | null) {
    const url = generateWhatsAppLink(items, total, currency)
    window.open(url, '_blank')
}
