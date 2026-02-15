import type { Currency } from "@/lib/currency-client";

type NumericLike =
  | number
  | string
  | null
  | undefined
  | { toNumber: () => number };

export interface ProductPriceLike {
  amount: NumericLike;
  saleAmount?: NumericLike;
  isDefault?: boolean | null;
  currency?: Currency | string | null;
  currencyId?: string | null;
}

export interface ProductVariantLike {
  isActive?: boolean | null;
  prices?: ProductPriceLike[] | null;
}

export interface ProductWithPricingLike {
  prices?: ProductPriceLike[] | null;
  variants?: ProductVariantLike[] | null;
}

interface PriceCandidate {
  effectivePrice: number;
  regularPrice?: number;
  isDefault: boolean;
  currency: Currency | string | null;
  currencyId: string | null;
}

export interface ResolvedProductListingPrice {
  price: number;
  regularPrice?: number;
  currency: Currency | string | null;
  hasPrice: boolean;
  usesVariantPricing: boolean;
}

const parseNumeric = (value: NumericLike): number | null => {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    const parsed = value.toNumber();
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toCandidate = (price: ProductPriceLike): PriceCandidate | null => {
  const amount = parseNumeric(price.amount);
  if (amount == null) return null;

  const sale = parseNumeric(price.saleAmount);
  const effectivePrice = sale ?? amount;
  const regularPrice = sale != null ? amount : undefined;

  return {
    effectivePrice,
    regularPrice,
    isDefault: price.isDefault === true,
    currency: price.currency ?? null,
    currencyId: price.currencyId ?? null,
  };
};

const pickPrimaryCandidate = (
  prices: ProductPriceLike[] | null | undefined,
  preferredCurrencyId?: string,
): PriceCandidate | null => {
  if (!prices || prices.length === 0) return null;

  const candidates = prices
    .map(toCandidate)
    .filter((candidate): candidate is PriceCandidate => candidate !== null);

  if (candidates.length === 0) return null;

  let scoped = candidates;
  if (preferredCurrencyId) {
    const preferred = candidates.filter(
      (candidate) => candidate.currencyId === preferredCurrencyId,
    );
    if (preferred.length > 0) scoped = preferred;
  }

  return scoped.find((candidate) => candidate.isDefault) ?? scoped[0];
};

export const resolveProductListingPrice = (
  product: ProductWithPricingLike,
  preferredCurrencyId?: string,
): ResolvedProductListingPrice => {
  const variantCandidates = (product.variants ?? [])
    .filter((variant) => variant.isActive !== false)
    .map((variant) => pickPrimaryCandidate(variant.prices, preferredCurrencyId))
    .filter((candidate): candidate is PriceCandidate => candidate !== null);

  if (variantCandidates.length > 0) {
    const bestVariantCandidate = variantCandidates.reduce((min, candidate) =>
      candidate.effectivePrice < min.effectivePrice ? candidate : min,
    );

    return {
      price: bestVariantCandidate.effectivePrice,
      regularPrice: bestVariantCandidate.regularPrice,
      currency: bestVariantCandidate.currency,
      hasPrice: true,
      usesVariantPricing: true,
    };
  }

  const productCandidate = pickPrimaryCandidate(
    product.prices,
    preferredCurrencyId,
  );
  if (productCandidate) {
    return {
      price: productCandidate.effectivePrice,
      regularPrice: productCandidate.regularPrice,
      currency: productCandidate.currency,
      hasPrice: true,
      usesVariantPricing: false,
    };
  }

  return {
    price: 0,
    regularPrice: undefined,
    currency: null,
    hasPrice: false,
    usesVariantPricing: false,
  };
};

export const getProductSortablePrice = (
  product: ProductWithPricingLike,
  preferredCurrencyId?: string,
): number | null => {
  const resolved = resolveProductListingPrice(product, preferredCurrencyId);
  return resolved.hasPrice ? resolved.price : null;
};
