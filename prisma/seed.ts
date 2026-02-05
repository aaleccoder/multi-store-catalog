import 'dotenv/config'
import { faker } from '@faker-js/faker'

type PrismaModule = {
  PrismaClient: new (...args: any[]) => any
  Prisma: {
    Decimal: new (value: string | number) => any
  }
}

const loadPrismaModule = async (): Promise<PrismaModule> => {
  try {
    return (await import('../generated/prisma/client')) as PrismaModule
  } catch (error) {
    console.error(
      'Prisma Client not found at ./generated/prisma. Run `pnpm prisma generate` or `pnpm db:seed` to generate it.',
    )
    throw error
  }
}

let prisma: any = null
let Prisma: PrismaModule['Prisma'] | null = null

type CurrencySeed = {
  name: string
  code: string
  symbol: string
  symbolPosition: string
  decimalSeparator: string
  thousandsSeparator: string
  decimalPlaces: number
}

const ACTIVE_CURRENCY_CODES = new Set(['USD', 'EUR', 'CUP'])

type StoreCategorySeed = {
  name: string
  slug: string
  description: string
  icon: string
}

type StoreThemeSeed = {
  name: string
  light: Record<string, string>
  dark: Record<string, string>
  fontId: string
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
    name: 'Dólar estadounidense',
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
    name: 'Libra esterlina',
    code: 'GBP',
    symbol: '£',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dólar canadiense',
    code: 'CAD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dólar australiano',
    code: 'AUD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dólar neozelandés',
    code: 'NZD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Franco suizo',
    code: 'CHF',
    symbol: 'CHF',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Yen japonés',
    code: 'JPY',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
  },
  {
    name: 'Yuan chino',
    code: 'CNY',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dólar de Hong Kong',
    code: 'HKD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dólar de Singapur',
    code: 'SGD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Won surcoreano',
    code: 'KRW',
    symbol: '₩',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
  },
  {
    name: 'Rupia india',
    code: 'INR',
    symbol: '₹',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Rupia indonesia',
    code: 'IDR',
    symbol: 'Rp',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso filipino',
    code: 'PHP',
    symbol: '₱',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Ringgit malayo',
    code: 'MYR',
    symbol: 'RM',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Baht tailandés',
    code: 'THB',
    symbol: '฿',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dong vietnamita',
    code: 'VND',
    symbol: '₫',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
  },
  {
    name: 'Corona sueca',
    code: 'SEK',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Corona noruega',
    code: 'NOK',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Corona danesa',
    code: 'DKK',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Zloty polaco',
    code: 'PLN',
    symbol: 'zł',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Corona checa',
    code: 'CZK',
    symbol: 'Kč',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Forinto húngaro',
    code: 'HUF',
    symbol: 'Ft',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Leu rumano',
    code: 'RON',
    symbol: 'lei',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Lev búlgaro',
    code: 'BGN',
    symbol: 'лв',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Rublo ruso',
    code: 'RUB',
    symbol: '₽',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Lira turca',
    code: 'TRY',
    symbol: '₺',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Rand sudafricano',
    code: 'ZAR',
    symbol: 'R',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Dírham de los Emiratos Árabes Unidos',
    code: 'AED',
    symbol: 'د.إ',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Riyal saudí',
    code: 'SAR',
    symbol: 'ر.س',
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Shékel israelí',
    code: 'ILS',
    symbol: '₪',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Real brasileño',
    code: 'BRL',
    symbol: 'R$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso mexicano',
    code: 'MXN',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso argentino',
    code: 'ARS',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso chileno',
    code: 'CLP',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
  },
  {
    name: 'Peso colombiano',
    code: 'COP',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Sol peruano',
    code: 'PEN',
    symbol: 'S/',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso uruguayo',
    code: 'UYU',
    symbol: '$U',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Boliviano',
    code: 'BOB',
    symbol: 'Bs',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Guaraní paraguayo',
    code: 'PYG',
    symbol: '₲',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
  },
  {
    name: 'Bolívar venezolano',
    code: 'VES',
    symbol: 'Bs',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso cubano',
    code: 'CUP',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Peso dominicano',
    code: 'DOP',
    symbol: 'RD$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Colón costarricense',
    code: 'CRC',
    symbol: '₡',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Quetzal guatemalteco',
    code: 'GTQ',
    symbol: 'Q',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Lempira hondureña',
    code: 'HNL',
    symbol: 'L',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Córdoba nicaragüense',
    code: 'NIO',
    symbol: 'C$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  {
    name: 'Balboa panameño',
    code: 'PAB',
    symbol: 'B/.',
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

const THEME_PRESETS: StoreThemeSeed[] = [
  {
    name: 'Coastal',
    fontId: 'lora',
    light: {
      background: 'oklch(98% 0.01 220)',
      foreground: 'oklch(20% 0.02 230)',
      primary: 'oklch(52% 0.14 240)',
      primaryForeground: 'oklch(98% 0 0)',
      accent: 'oklch(90% 0.05 200)',
      accentForeground: 'oklch(20% 0.02 230)',
      card: 'oklch(99% 0.005 220)',
      cardForeground: 'oklch(20% 0.02 230)',
      border: 'oklch(88% 0.02 220)',
      ring: 'oklch(60% 0.12 230)',
      radius: '0.75rem',
    },
    dark: {
      background: 'oklch(16% 0.02 230)',
      foreground: 'oklch(92% 0.01 220)',
      primary: 'oklch(75% 0.12 230)',
      primaryForeground: 'oklch(15% 0.02 230)',
      accent: 'oklch(28% 0.03 220)',
      accentForeground: 'oklch(92% 0.01 220)',
      card: 'oklch(20% 0.02 230)',
      cardForeground: 'oklch(92% 0.01 220)',
      border: 'oklch(30% 0.02 230)',
      ring: 'oklch(70% 0.1 230)',
      radius: '0.75rem',
    },
  },
  {
    name: 'Sunset Market',
    fontId: 'playfair',
    light: {
      background: 'oklch(98% 0.02 30)',
      foreground: 'oklch(20% 0.03 20)',
      primary: 'oklch(58% 0.19 35)',
      primaryForeground: 'oklch(98% 0 0)',
      accent: 'oklch(90% 0.08 45)',
      accentForeground: 'oklch(20% 0.03 20)',
      card: 'oklch(99% 0.01 30)',
      cardForeground: 'oklch(20% 0.03 20)',
      border: 'oklch(88% 0.04 30)',
      ring: 'oklch(60% 0.18 35)',
      radius: '0.5rem',
    },
    dark: {
      background: 'oklch(15% 0.04 25)',
      foreground: 'oklch(92% 0.02 35)',
      primary: 'oklch(78% 0.16 40)',
      primaryForeground: 'oklch(14% 0.03 25)',
      accent: 'oklch(26% 0.05 30)',
      accentForeground: 'oklch(92% 0.02 35)',
      card: 'oklch(20% 0.04 25)',
      cardForeground: 'oklch(92% 0.02 35)',
      border: 'oklch(30% 0.04 30)',
      ring: 'oklch(72% 0.15 35)',
      radius: '0.5rem',
    },
  },
  {
    name: 'Forest Atelier',
    fontId: 'merriweather',
    light: {
      background: 'oklch(97% 0.02 145)',
      foreground: 'oklch(18% 0.03 150)',
      primary: 'oklch(42% 0.14 150)',
      primaryForeground: 'oklch(98% 0 0)',
      accent: 'oklch(88% 0.07 140)',
      accentForeground: 'oklch(18% 0.03 150)',
      card: 'oklch(98% 0.02 145)',
      cardForeground: 'oklch(18% 0.03 150)',
      border: 'oklch(86% 0.04 145)',
      ring: 'oklch(50% 0.12 150)',
      radius: '0.65rem',
    },
    dark: {
      background: 'oklch(14% 0.03 150)',
      foreground: 'oklch(92% 0.02 140)',
      primary: 'oklch(70% 0.12 150)',
      primaryForeground: 'oklch(14% 0.03 150)',
      accent: 'oklch(26% 0.05 145)',
      accentForeground: 'oklch(92% 0.02 140)',
      card: 'oklch(18% 0.03 150)',
      cardForeground: 'oklch(92% 0.02 140)',
      border: 'oklch(30% 0.04 150)',
      ring: 'oklch(65% 0.1 150)',
      radius: '0.65rem',
    },
  },
  {
    name: 'Studio Noir',
    fontId: 'inter',
    light: {
      background: 'oklch(98% 0 0)',
      foreground: 'oklch(16% 0 0)',
      primary: 'oklch(28% 0.02 0)',
      primaryForeground: 'oklch(98% 0 0)',
      accent: 'oklch(92% 0 0)',
      accentForeground: 'oklch(18% 0 0)',
      card: 'oklch(99% 0 0)',
      cardForeground: 'oklch(18% 0 0)',
      border: 'oklch(90% 0 0)',
      ring: 'oklch(30% 0.02 0)',
      radius: '0.35rem',
    },
    dark: {
      background: 'oklch(10% 0 0)',
      foreground: 'oklch(92% 0 0)',
      primary: 'oklch(85% 0 0)',
      primaryForeground: 'oklch(10% 0 0)',
      accent: 'oklch(24% 0 0)',
      accentForeground: 'oklch(92% 0 0)',
      card: 'oklch(14% 0 0)',
      cardForeground: 'oklch(92% 0 0)',
      border: 'oklch(24% 0 0)',
      ring: 'oklch(80% 0 0)',
      radius: '0.35rem',
    },
  },
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
  if (!Prisma) {
    throw new Error('Prisma Client not initialized.')
  }

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

const buildTheme = (storeName: string, themeIndex: number) => {
  const preset = THEME_PRESETS[themeIndex % THEME_PRESETS.length]
  const logoSeed = slugify(storeName || `store-${themeIndex}`)

  return {
    light: preset.light,
    dark: preset.dark,
    fontId: preset.fontId,
    branding: {
      logoUrl: imageUrl(`logo-${logoSeed}`, 320, 200),
      logoAlt: `${storeName} logo`,
      logoWidth: 140,
      logoHeight: 140,
      faviconUrl: imageUrl(`favicon-${logoSeed}`, 64, 64),
      contactEmail: faker.internet.email().toLowerCase(),
      contactPhone: faker.phone.number(),
      contactAddress: faker.location.streetAddress(),
      socialFacebook: `https://facebook.com/${slugify(storeName)}`,
      socialInstagram: `https://instagram.com/${slugify(storeName)}`,
      socialTwitter: `https://x.com/${slugify(storeName)}`,
    },
  }
}

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

const getDatabaseLabel = () => {
  const url = process.env.DATABASE_URL
  if (!url) return 'DATABASE_URL not set'

  try {
    const parsed = new URL(url)
    const dbName = parsed.pathname.replace(/^\//, '') || '(no database)'
    const schema = parsed.searchParams.get('schema')
    return `${parsed.hostname}/${dbName}${schema ? ` (schema: ${schema})` : ''}`
  } catch {
    return 'DATABASE_URL is invalid'
  }
}

async function main() {
  const prismaModule = await loadPrismaModule()
  Prisma = prismaModule.Prisma
  prisma = new prismaModule.PrismaClient()

  console.log('Seeding database:', getDatabaseLabel())

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

  const globalCurrencies = await Promise.all(
    CURRENCIES.map((currency) =>
      prisma.currency.upsert({
        where: { code: currency.code },
        update: {
          name: currency.name,
          symbol: currency.symbol,
          symbolPosition: currency.symbolPosition,
          decimalSeparator: currency.decimalSeparator,
          thousandsSeparator: currency.thousandsSeparator,
          decimalPlaces: currency.decimalPlaces,
          isActive: ACTIVE_CURRENCY_CODES.has(currency.code),
        },
        create: {
          ...currency,
          isActive: ACTIVE_CURRENCY_CODES.has(currency.code),
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

  let storeThemeIndex = 0

  for (const user of users) {
    const storeCount = randomInt(CONFIG.storesPerUser.min, CONFIG.storesPerUser.max)

    for (let storeIndex = 0; storeIndex < storeCount; storeIndex += 1) {
      const storeName = faker.company.name()
      const storeSlug = uniqueSlug(storeName, storeSlugSet)
      const themeIndex = storeThemeIndex % THEME_PRESETS.length
      storeThemeIndex += 1

      const store = await prisma.store.create({
        data: {
          name: storeName,
          slug: storeSlug,
          description: faker.company.catchPhrase(),
          isActive: true,
          ownerId: user.id,
          theme: buildTheme(storeName, themeIndex),
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

      const currencies = globalCurrencies
      if (currencies.length > 0) {
        await prisma.storeCurrency.createMany({
          data: currencies.map((currency) => ({
            storeId: store.id,
            currencyId: currency.id,
            isEnabled: ACTIVE_CURRENCY_CODES.has(currency.code),
          })),
        })
      }
      const pricingCurrencies =
        currencies.length > 0
          ? pickMany(currencies, randomInt(2, Math.min(4, currencies.length)))
          : []

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

            for (const [currencyIndex, currency] of pricingCurrencies.entries()) {
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

              for (const [currencyIndex, currency] of pricingCurrencies.entries()) {
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

  const [
    userCount,
    storeCount,
    categoryCount,
    subcategoryCount,
    productCount,
    variantCount,
    priceCount,
    mediaCount,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.store.count(),
    prisma.category.count(),
    prisma.subcategory.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.price.count(),
    prisma.media.count(),
  ])

  console.log('Seed summary:', {
    users: userCount,
    stores: storeCount,
    categories: categoryCount,
    subcategories: subcategoryCount,
    products: productCount,
    variants: variantCount,
    prices: priceCount,
    media: mediaCount,
  })
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
    if (prisma) {
      await prisma.$disconnect()
    }
  })
