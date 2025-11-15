import '../globals.css'
import { Header } from '@/components/Header'
import { CategoryBarWrapper } from '@/components/CategoryBarWrapper'
import { FilterSidebar, getFilterContent } from '@/components/FilterSidebar'
import { ProductGridClient } from '@/components/ProductGridClient'
import { NavigationLoadingBar } from '@/components/NavigationLoadingBar'
import { LoadingProvider } from '@/components/LoadingContext'
import { PageLayoutWrapper } from '@/components/PageLayoutWrapper'
import { SearchAndFiltersBar } from '@/components/SearchAndFiltersBar'

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    subcategory?: string
    [key: string]: string | string[] | undefined
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const categorySlug = params.category
  const subcategorySlug = params.subcategory

  // Get filter content for mobile sheet
  const filterContent = await getFilterContent(categorySlug, subcategorySlug)

  return (
    <LoadingProvider>
      <div className="h-screen bg-background flex flex-col md:overflow-hidden pb-16 md:pb-0">
        <NavigationLoadingBar />
        <Header />
        <SearchAndFiltersBar filterContent={filterContent} />
        <CategoryBarWrapper selectedCategorySlug={categorySlug} />
        <PageLayoutWrapper filterContent={filterContent}>
          <div className="flex flex-1 md:overflow-hidden">
            <FilterSidebar categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
            <main className="flex-1 md:overflow-hidden bg-white">
              <ProductGridClient categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
            </main>
          </div>
        </PageLayoutWrapper>
      </div>
    </LoadingProvider>
  )
}
