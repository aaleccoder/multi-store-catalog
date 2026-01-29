import '@/app/globals.css'
import { Header } from '@/components/layout/header'
import { CategoryBarWrapper } from '@/components/categories/category-bar-wrapper'
import { getFilterContent } from '@/components/filters/filter-sidebar'
import { ProductGridClient } from '@/components/products/product-grid-client'
import { NavigationLoadingBar } from '@/components/utils/navigation-loading'
import { LoadingProvider } from '@/components/utils/loading-context'
import { PageLayoutWrapper } from '@/components/layout/page-layout-wrapper'
import { SearchAndFiltersBar } from '@/components/search/search-and-filter-mobile'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { StoreThemeProvider } from '@/components/theme/store-theme-provider'
import type { StoreTheme } from '@/lib/theme'

interface HomePageProps {
  params: {
    store: string
  }
  searchParams: {
    category?: string
    subcategory?: string
    [key: string]: string | string[] | undefined
  }
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { store: storeSlug } = params
  const queryParams = searchParams
  const categorySlug = queryParams.category
  const subcategorySlug = queryParams.subcategory

  const store = await prisma.store.findUnique({ where: { slug: storeSlug, isActive: true } })
  if (!store) {
    notFound()
  }

  const filterContent = await getFilterContent(storeSlug, store.id, categorySlug, subcategorySlug)
  const storeTheme = (store.theme ?? null) as unknown as StoreTheme | null

  return (
    <StoreThemeProvider theme={storeTheme ?? undefined}>
      <LoadingProvider>
        <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
          <NavigationLoadingBar />
          <Header storeSlug={storeSlug} />
          <CategoryBarWrapper storeSlug={storeSlug} selectedCategorySlug={categorySlug} />
          <PageLayoutWrapper filterContent={filterContent}>
            <div className="flex flex-1">
              <main className="flex-1 bg-white">
                <ProductGridClient
                  storeSlug={storeSlug}
                  categorySlug={categorySlug}
                  subcategorySlug={subcategorySlug}
                  filterContent={filterContent}
                />
              </main>
            </div>
          </PageLayoutWrapper>
        </div>
      </LoadingProvider>
    </StoreThemeProvider>
  )
}
