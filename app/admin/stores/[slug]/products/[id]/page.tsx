import { ProductForm } from "@/components/admin/product-form"

interface ProductEditPageProps {
    params: { slug: string; id: string }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
    return <ProductForm productId={params.id} storeSlug={params.slug} />
}
