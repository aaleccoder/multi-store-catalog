import { ProductForm } from '@/components/admin/product-form'

interface NewProductPageProps {
    params: Promise<{ slug: string }>
}

export default async function NewProductPage({ params }: NewProductPageProps) {
    const { slug } = await params
    return <ProductForm storeSlug={slug} />
}
