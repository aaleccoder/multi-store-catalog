import { prisma } from '@/lib/db'
import { CategoryBar } from './category-bar'

interface CategoryBarWrapperProps {
  selectedCategorySlug?: string
}

export const CategoryBarWrapper = async ({ selectedCategorySlug }: CategoryBarWrapperProps) => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const formattedCategories = categories.map((category) => ({
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    image: null, // Prisma schema doesn't have image field for categories
  }))

  return (
    <CategoryBar selectedCategorySlug={selectedCategorySlug} categories={formattedCategories} />
  )
}
