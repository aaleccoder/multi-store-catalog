import { ProductForm } from '@/components/admin/product-form'

interface NewProductPageProps {
    params: { slug: string }
}

export default function NewProductPage({ params }: NewProductPageProps) {
    return <ProductForm storeSlug={params.slug} />
}
