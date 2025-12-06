import { CategoryBar } from "@/components/categories/category-bar"

interface CategoryBarWrapperProps {
  storeSlug: string
  selectedCategorySlug?: string
}

export const CategoryBarWrapper = ({ storeSlug, selectedCategorySlug }: CategoryBarWrapperProps) => {
  return <CategoryBar storeSlug={storeSlug} selectedCategorySlug={selectedCategorySlug} />
}
