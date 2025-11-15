import { config } from 'dotenv'
import { prisma } from '@/lib/db'

config({ path: '.env' })

async function fixImageUrls() {
    console.log('Fixing image URLs in database...')

    // Fix media URLs
    const mediaRecords = await prisma.media.findMany()
    for (const media of mediaRecords) {
        if (media.url.includes('http://undefined:undefined')) {
            const newUrl = media.url.replace('http://undefined:undefined/lea/', 'http://cataloglea-minio-23b34e-31-97-130-237.traefik.me/lea/')
            await prisma.media.update({
                where: { id: media.id },
                data: { url: newUrl }
            })
            console.log(`Updated media ${media.id}: ${newUrl}`)
        }
    }

    // Fix product coverImages
    const products = await prisma.product.findMany()
    for (const product of products) {
        const coverImages = product.coverImages as any[]
        let updated = false
        const newCoverImages = coverImages.map((img: any) => {
            if (img.url && img.url.includes('http://undefined:undefined')) {
                updated = true
                return {
                    ...img,
                    url: img.url.replace('http://undefined:undefined/lea/', 'http://cataloglea-minio-23b34e-31-97-130-237.traefik.me/lea/')
                }
            }
            return img
        })
        if (updated) {
            await prisma.product.update({
                where: { id: product.id },
                data: { coverImages: newCoverImages }
            })
            console.log(`Updated product ${product.id} coverImages`)
        }
    }

    console.log('Done fixing image URLs.')
}

fixImageUrls().catch(console.error)