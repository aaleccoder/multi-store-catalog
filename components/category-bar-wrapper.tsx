import { CategoryBar } from './category-bar'

interface CategoryBarWrapperProps {
  selectedCategorySlug?: string
}

export const CategoryBarWrapper = ({ selectedCategorySlug }: CategoryBarWrapperProps) => {
  return <CategoryBar selectedCategorySlug={selectedCategorySlug} />
}
