import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { PrismaClient, Prisma } from '../generated/prisma'

const prisma = new PrismaClient()

type CurrencySeed = {
  name: string
  code: string
  symbol: string
  symbolPosition: string
  decimalSeparator: string
  thousandsSeparator: string
  decimalPlaces: number
}

type StoreCategorySeed = {
  name: string
  slug: string
  description: string
  icon: string
}

const CONFIG = {
  users: 4,
  storesPerUser: { min: 1, max: 2 },
  categoriesPerStore: 4,
  subcategoriesPerCategory: 3,
  productsPerSubcategory: 6,
  variantsPerProduct: { min: 1, max: 3 },
  productImages: { min: 1, max: 3 },
  variantImages: { min: 0, max: 2 },
}

const STORE_CATEGORIES: StoreCategorySeed[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Devices, gadgets, and accessories for modern life.',
    icon: 'cpu',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, and tools to refresh any space.',
    icon: 'sofa',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear, and accessories for every season.',
    icon: 'shirt',
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Gear for training, travel, and adventure.',
    icon: 'trophy',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, wellness, and self-care essentials.',
    icon: 'sparkles',
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Playful picks for kids, families, and collectors.',
    icon: 'gamepad-2',
  },
]

const CURRENCIES: CurrencySeed[] = [
  {
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Mexican Peso',
    code: 'MXN',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
]

const COLOR_OPTIONS = [
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Amber', value: 'amber' },
  { label: 'Sand', value: 'sand' },
]

const SIZE_OPTIONS = [
  { label: 'XS', value: 'xs' },
  { label: 'S', value: 's' },
  { label: 'M', value: 'm' },
  { label: 'L', value: 'l' },
  { label: 'XL', value: 'xl' },
]

const MATERIAL_OPTIONS = [
  { label: 'Aluminum', value: 'aluminum' },
  { label: 'Cotton', value: 'cotton' },
  { label: 'Leather', value: 'leather' },
  { label: 'Glass', value: 'glass' },
  { label: 'Steel', value: 'steel' },
  { label: 'Wood', value: 'wood' },
]

const BRAND_OPTIONS = [
  { label: 'Acme', value: 'acme' },
  { label: 'Nova', value: 'nova' },
  { label: 'Atlas', value: 'atlas' },
  { label: 'Solstice', value: 'solstice' },
  { label: 'Vertex', value: 'vertex' },
  { label: 'Pulse', value: 'pulse' },
]

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const uniqueSlug = (value: string, used: Set<string>) => {
  const base = slugify(value)
  let slug = base || faker.string.alphanumeric({ length: 6, casing: 'lower' })
  while (used.has(slug)) {
    slug = `${base}-${faker.string.alphanumeric({ length: 4, casing: 'lower' })}`
  }
  used.add(slug)
  return slug
}

const randomInt = (min: number, max: number) =>
  faker.number.int({ min, max })

const randomFloat = (min: number, max: number, precision = 2) => {
  const factor = 10 ** precision
  return randomInt(Math.round(min * factor), Math.round(max * factor)) / factor
}

const pickMany = <T,>(items: T[], count: number) =>
  faker.helpers.arrayElements(items, count)

const imageUrl = (seed: string, width = 1200, height = 900) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`

const buildFilters = () => [
  {
    name: 'Brand',
    slug: 'brand',
    type: 'select',
    options: BRAND_OPTIONS,
  },
  {
    name: 'Color',
    slug: 'color',
    type: 'multiselect',
    options: COLOR_OPTIONS,
  },
  {
    name: 'Material',
    slug: 'material',
    type: 'select',
    options: MATERIAL_OPTIONS,
  },
  {
    name: 'Wireless',
    slug: 'wireless',
    type: 'boolean',
  },
  {
    name: 'Weight',
    slug: 'weight',
    type: 'range',
    unit: 'g',
  },
]

const buildSpecifications = () => ({
  sku: faker.string.alphanumeric({ length: 10, casing: 'upper' }),
  weight: randomInt(150, 5000),
  weightUnit: 'g',
  dimensions: {
    length: randomInt(10, 80),
    width: randomInt(10, 60),
    height: randomInt(5, 40),
    unit: 'cm',
  },
  volume: randomInt(250, 2000),
  volumeUnit: 'ml',
  unit: `${randomInt(1, 6)} pcs`,
})

const buildMetaData = (name: string) => ({
  seoTitle: name,
  seoDescription: faker.lorem.sentence(),
  warrantyMonths: randomInt(6, 36),
  origin: faker.location.country(),
})

const buildFilterValues = () => {
  const brand = faker.helpers.arrayElement(BRAND_OPTIONS)
  const color = faker.helpers.arrayElement(COLOR_OPTIONS)
  const material = faker.helpers.arrayElement(MATERIAL_OPTIONS)
  return [
    { slug: 'brand', value: brand.value },
    { slug: 'color', value: color.value },
    { slug: 'material', value: material.value },
    { slug: 'wireless', value: faker.datatype.boolean() },
  ]
}

const buildTags = () => {
  const tagWords = [
    faker.commerce.productAdjective(),
    faker.commerce.productMaterial(),
    faker.commerce.product(),
  ]
  return Array.from(new Set(tagWords.map((tag) => tag.toLowerCase())))
}

const buildPriceAmounts = (baseCents: number, multiplier: number) => {
  const adjusted = Math.max(199, Math.round(baseCents * multiplier))
  const saleChance = faker.number.int({ min: 1, max: 100 }) <= 35
  const saleCents = saleChance
    ? Math.max(99, adjusted - faker.number.int({ min: 50, max: 1500 }))
    : null

  return {
    amount: new Prisma.Decimal((adjusted / 100).toFixed(2)),
    saleAmount: saleCents
      ? new Prisma.Decimal((saleCents / 100).toFixed(2))
      : undefined,
  }
}

const buildTheme = () => ({
  primary: faker.color.rgb({ format: 'hex' }),
  accent: faker.color.rgb({ format: 'hex' }),
  surface: faker.color.rgb({ format: 'hex' }),
  logoUrl: imageUrl(`logo-${faker.string.alphanumeric(6)}`, 320, 200),
})

const buildSettings = (storeName: string) => ({
  storeName,
  supportEmail: faker.internet.email().toLowerCase(),
  supportPhone: faker.phone.number(),
  locale: faker.location.countryCode(),
  taxRate: randomFloat(0, 0.2, 2),
  shipping: {
    provider: faker.company.name(),
    flatRate: faker.number.int({ min: 5, max: 25 }),
    freeOver: faker.number.int({ min: 75, max: 200 }),
  },
})

async function main() {
  if (process.env.FAKER_SEED) {
    faker.seed(Number(process.env.FAKER_SEED))
  }

  const storeCategories = await Promise.all(
    STORE_CATEGORIES.map((category) =>
      prisma.storeCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          isActive: true,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          isActive: true,
        },
      }),
    ),
  )

  const storeSlugSet = new Set<string>()
  const users: Array<{ id: string; email: string; name: string }> = []

  for (let index = 0; index < CONFIG.users; index += 1) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const email = faker.internet.email({ firstName, lastName }).toLowerCase()

    const user = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: faker.datatype.boolean(),
        image: faker.image.avatar(),
        role: index === 0 ? 'ADMIN' : 'EDITOR',
        isPaid: faker.datatype.boolean(),
      },
    })

    users.push({ id: user.id, email: user.email, name: user.name })
  }

  for (const user of users) {
    const storeCount = randomInt(CONFIG.storesPerUser.min, CONFIG.storesPerUser.max)

    for (let storeIndex = 0; storeIndex < storeCount; storeIndex += 1) {
      const storeName = faker.company.name()
      const storeSlug = uniqueSlug(storeName, storeSlugSet)

      const store = await prisma.store.create({
        data: {
          name: storeName,
          slug: storeSlug,
          description: faker.company.catchPhrase(),
          isActive: true,
          ownerId: user.id,
          theme: buildTheme(),
        },
      })

      await prisma.settings.create({
        data: {
          storeId: store.id,
          settings: buildSettings(storeName),
        },
      })

      const assignedCategories = pickMany(
        storeCategories,
        randomInt(2, Math.min(4, storeCategories.length)),
      )

      await prisma.storeCategoryAssignment.createMany({
        data: assignedCategories.map((category) => ({
          storeId: store.id,
          storeCategoryId: category.id,
        })),
      })

      const currencySeeds = pickMany(CURRENCIES, randomInt(2, 3))
      const currencies = []

      for (const currencySeed of currencySeeds) {
        const currency = await prisma.currency.upsert({
          where: {
            storeId_code: {
              storeId: store.id,
              code: currencySeed.code,
            },
          },
          update: {
            name: currencySeed.name,
            symbol: currencySeed.symbol,
            symbolPosition: currencySeed.symbolPosition,
            decimalSeparator: currencySeed.decimalSeparator,
            thousandsSeparator: currencySeed.thousandsSeparator,
            decimalPlaces: currencySeed.decimalPlaces,
            isActive: true,
          },
          create: {
            ...currencySeed,
            storeId: store.id,
            isActive: true,
          },
        })

        currencies.push(currency)
      }

      const categorySlugSet = new Set<string>()
      const categoryNameSet = new Set<string>()
      const subcategorySlugSet = new Set<string>()
      const subcategoryNameSet = new Set<string>()
      const productSlugSet = new Set<string>()

      for (let categoryIndex = 0; categoryIndex < CONFIG.categoriesPerStore; categoryIndex += 1) {
        let categoryName = `${faker.commerce.department()} ${faker.commerce.productAdjective()}`
        while (categoryNameSet.has(categoryName)) {
          categoryName = `${faker.commerce.department()} ${faker.commerce.productAdjective()}`
        }
        categoryNameSet.add(categoryName)

        const category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: uniqueSlug(categoryName, categorySlugSet),
            description: faker.lorem.sentence(),
            icon: faker.helpers.arrayElement([
              'shopping-bag',
              'cpu',
              'sofa',
              'shirt',
              'camera',
              'sparkles',
            ]),
            isActive: true,
            filters: buildFilters(),
            storeId: store.id,
          },
        })

        for (
          let subcategoryIndex = 0;
          subcategoryIndex < CONFIG.subcategoriesPerCategory;
          subcategoryIndex += 1
        ) {
          let subcategoryName = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`
          while (subcategoryNameSet.has(subcategoryName)) {
            subcategoryName = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`
          }
          subcategoryNameSet.add(subcategoryName)

          const subcategory = await prisma.subcategory.create({
            data: {
              name: subcategoryName,
              slug: uniqueSlug(subcategoryName, subcategorySlugSet),
              description: faker.lorem.sentence(),
              isActive: true,
              filters: buildFilters(),
              storeId: store.id,
              categoryId: category.id,
            },
          })

          for (
            let productIndex = 0;
            productIndex < CONFIG.productsPerSubcategory;
            productIndex += 1
          ) {
            const productName = `${faker.commerce.productAdjective()} ${faker.commerce.product()}`
            const productSlug = uniqueSlug(productName, productSlugSet)

            const product = await prisma.product.create({
              data: {
                name: productName,
                slug: productSlug,
                description: faker.commerce.productDescription(),
                shortDescription: faker.lorem.sentence(),
                specifications: buildSpecifications(),
                filterValues: buildFilterValues(),
                tags: buildTags(),
                metaData: buildMetaData(productName),
                isActive: faker.datatype.boolean(),
                inStock: faker.datatype.boolean(),
                featured: faker.number.int({ min: 1, max: 100 }) <= 20,
                storeId: store.id,
                categoryId: category.id,
                subcategoryId: subcategory.id,
              },
            })

            const productImageCount = randomInt(
              CONFIG.productImages.min,
              CONFIG.productImages.max,
            )

            await prisma.media.createMany({
              data: Array.from({ length: productImageCount }).map((_, imageIndex) => ({
                alt: `${productName} image ${imageIndex + 1}`,
                url: imageUrl(`${product.id}-${imageIndex}`),
                productId: product.id,
              })),
            })

            const basePriceCents = randomInt(1500, 120000)

            for (const [currencyIndex, currency] of currencies.entries()) {
              const multiplier =
                currencyIndex === 0
                  ? 1
                  : randomFloat(0.8, 1.3, 2)

              const { amount, saleAmount } = buildPriceAmounts(basePriceCents, multiplier)

              await prisma.price.create({
                data: {
                  amount,
                  saleAmount,
                  currencyId: currency.id,
                  storeId: store.id,
                  productId: product.id,
                  isDefault: currencyIndex === 0,
                  taxIncluded: faker.datatype.boolean(),
                },
              })
            }

            const variantCount = randomInt(
              CONFIG.variantsPerProduct.min,
              CONFIG.variantsPerProduct.max,
            )

            for (let variantIndex = 0; variantIndex < variantCount; variantIndex += 1) {
              const color = faker.helpers.arrayElement(COLOR_OPTIONS)
              const size = faker.helpers.arrayElement(SIZE_OPTIONS)
              const variantName = `${color.label} / ${size.label}`

              const variant = await prisma.productVariant.create({
                data: {
                  name: variantName,
                  sku: faker.string.alphanumeric({ length: 12, casing: 'upper' }),
                  stock: randomInt(0, 80),
                  attributes: {
                    color: color.value,
                    size: size.value,
                  },
                  isActive: faker.datatype.boolean(),
                  image: imageUrl(`${product.id}-${variantIndex}-primary`, 800, 800),
                  description: faker.lorem.sentences(2),
                  shortDescription: faker.lorem.sentence(),
                  specifications: buildSpecifications(),
                  productId: product.id,
                },
              })

              const variantImageCount = randomInt(
                CONFIG.variantImages.min,
                CONFIG.variantImages.max,
              )

              if (variantImageCount > 0) {
                await prisma.media.createMany({
                  data: Array.from({ length: variantImageCount }).map((_, imageIndex) => ({
                    alt: `${productName} variant ${variantName} image ${imageIndex + 1}`,
                    url: imageUrl(`${variant.id}-${imageIndex}`, 900, 900),
                    productVariantId: variant.id,
                  })),
                })
              }

              for (const [currencyIndex, currency] of currencies.entries()) {
                const multiplier =
                  currencyIndex === 0
                  ? 1
                  : randomFloat(0.8, 1.3, 2)

                const { amount, saleAmount } = buildPriceAmounts(
                  Math.round(basePriceCents * 1.05),
                  multiplier,
                )

                await prisma.price.create({
                  data: {
                    amount,
                    saleAmount,
                    currencyId: currency.id,
                    storeId: store.id,
                    productVariantId: variant.id,
                    isDefault: currencyIndex === 0,
                    taxIncluded: faker.datatype.boolean(),
                  },
                })
              }
            }
          }
        }
      }

      await prisma.store.update({
        where: { id: store.id },
        data: { updatedAt: new Date() },
      })
    }
  }
}

main()
  .then(() => {
    console.log('Seed complete.')
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
