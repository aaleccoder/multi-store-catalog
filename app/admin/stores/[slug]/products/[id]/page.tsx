import { ProductForm } from "@/components/admin/product-form"

interface ProductEditPageProps {
    params: Promise<{ slug: string; id: string }>
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
    const { slug, id } = await params
    return <ProductForm productId={id} storeSlug={slug} />
}
