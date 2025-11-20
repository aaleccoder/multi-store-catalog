import '../globals.css'
import { Header } from '@/components/header'
import { CategoryBarWrapper } from '@/components/category-bar-wrapper'
import { getFilterContent } from '@/components/filter-sidebar'
import { ProductGridClient } from '@/components/product-grid-client'
import { NavigationLoadingBar } from '@/components/navigation-loading'
import { LoadingProvider } from '@/components/loading-context'
import { PageLayoutWrapper } from '@/components/page-layout-wrapper'
import { SearchAndFiltersBar } from '@/components/search-and-filter-mobile'

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

  const filterContent = await getFilterContent(categorySlug, subcategorySlug)

  return (
    <LoadingProvider>
      <div className="h-screen bg-background flex flex-col md:overflow-hidden pb-16 md:pb-0">
        <NavigationLoadingBar />
        <Header />
        <CategoryBarWrapper selectedCategorySlug={categorySlug} />
        <SearchAndFiltersBar filterContent={filterContent} />
        <PageLayoutWrapper filterContent={filterContent}>
          <div className="flex flex-1 md:overflow-hidden">
            <main className="flex-1 md:overflow-hidden bg-white">
              <ProductGridClient
                categorySlug={categorySlug}
                subcategorySlug={subcategorySlug}
                filterContent={filterContent}
              />
            </main>
          </div>
        </PageLayoutWrapper>
      </div>
    </LoadingProvider>
  )
}
