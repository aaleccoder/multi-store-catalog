import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/number";
import { TRPCError } from "@trpc/server";

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        page: z.string().optional(),
        limit: z.string().optional(),
        sort: z.string().optional(),
        category: z.union([z.string(), z.number()]).optional(),
        subcategory: z.union([z.string(), z.number()]).optional(),
        inStock: z.string().optional(),
        featured: z.string().optional(),
        search: z.string().optional(),
        currency: z.string().optional(),
        price: z.string().optional().nullable(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const searchParams = input;

        const store = await prisma.store.findUnique({
          where: { slug: searchParams.storeSlug },
        });
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        const enabledCurrencyIds = (
          await prisma.storeCurrency.findMany({
            where: {
              storeId: store.id,
              isEnabled: true,
              currency: { isActive: true },
            },
            select: { currencyId: true },
          })
        ).map((item) => item.currencyId);

        const page = parseInt(searchParams.page ?? "1");
        const limit = parseInt(searchParams.limit ?? "12");
        const skip = (page - 1) * limit;

        const sort = searchParams.sort ?? "-createdAt";
        let orderBy: any = {};
        let shouldSortByPrice = false;

        if (sort === "-createdAt") orderBy = { id: "desc" };
        else if (sort === "createdAt") orderBy = { id: "asc" };
        else if (sort === "name") orderBy = { name: "asc" };
        else if (sort === "-name") orderBy = { name: "desc" };
        else if (sort === "price" || sort === "-price") {
          shouldSortByPrice = true;
        }

        const where: any = { isActive: true, storeId: store.id };

        if (searchParams.category) where.categoryId = searchParams.category;
        if (searchParams.subcategory)
          where.subcategoryId = searchParams.subcategory;
        if (searchParams.inStock === "true") where.inStock = true;
        if (searchParams.featured === "true") where.featured = true;

        const search = searchParams.search;

        const currency = searchParams.currency;
        const isCurrencyEnabled =
          currency ? enabledCurrencyIds.includes(currency) : false;
        if (currency) {
          where.prices = isCurrencyEnabled
            ? { some: { currencyId: currency, storeId: store.id } }
            : { some: { currencyId: "__disabled_currency__" } };
        }

        const price = searchParams.price;
        if (price) {
          const [minStr, maxStr] = price.split("-");
          const min = minStr !== "" ? parseFloat(minStr) : undefined;
          const max = maxStr !== "" ? parseFloat(maxStr) : undefined;
          const priceWhere: any = {};
          if (min !== undefined && !isNaN(min))
            priceWhere.amount = { ...(priceWhere.amount ?? {}), gte: min };
          if (max !== undefined && !isNaN(max))
            priceWhere.amount = { ...(priceWhere.amount ?? {}), lte: max };

          if (Object.keys(priceWhere).length > 0) {
            if (currency && !isCurrencyEnabled) {
              where.prices = {
                some: { currencyId: "__disabled_currency__" },
              };
            } else if (where.prices) {
              where.prices = {
                some: {
                  currencyId: currency ?? { in: enabledCurrencyIds },
                  ...priceWhere,
                },
              };
            } else {
              where.prices = {
                some: {
                  currencyId: { in: enabledCurrencyIds },
                  ...priceWhere,
                },
              };
            }
          }
        }

        const rawProducts = await prisma.product.findMany({
          where,
          orderBy: shouldSortByPrice ? { id: "asc" } : orderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            description: true,
            categoryId: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            subcategory: {
              select: {
                name: true,
                slug: true,
              },
            },
            prices: {
              where: { currencyId: { in: enabledCurrencyIds } },
              include: { currency: true },
            },
            coverImages: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
            inStock: true,
            isActive: true,
            featured: true,
            specifications: true,
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                isActive: true,
                prices: {
                  where: { currencyId: { in: enabledCurrencyIds } },
                  include: { currency: true },
                },
              },
            },
          },
        });

        let filteredProducts = rawProducts;

        if (search) {
          const normalizedSearch = search
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          filteredProducts = rawProducts.filter((prod) => {
            const normalizedName = prod.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            const normalizedShort =
              prod.shortDescription
                ?.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase() || "";
            const normalizedDesc =
              prod.description
                ?.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase() || "";
            return (
              normalizedName.includes(normalizedSearch) ||
              normalizedShort.includes(normalizedSearch) ||
              normalizedDesc.includes(normalizedSearch)
            );
          });
        }

        const totalDocs = filteredProducts.length;
        const paginatedProducts = filteredProducts.slice(skip, skip + limit);

        let products = paginatedProducts.map((prod) => ({
          ...prod,
          prices:
            prod.prices?.map((p) => ({
              ...p,
              amount: toNumber(p.amount),
              saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
            })) || [],
          variants:
            prod.variants?.map((v) => ({
              ...v,
              prices:
                v.prices?.map((p) => ({
                  ...p,
                  amount: toNumber(p.amount),
                  saleAmount:
                    p.saleAmount == null ? null : toNumber(p.saleAmount),
                })) || [],
            })) || [],
        }));

        if (shouldSortByPrice) {
          const getMinPrice = (product: any) => {
            const prices: number[] = [];

            if (product.variants?.length > 0) {
              product.variants.forEach((variant: any) => {
                if (variant.isActive && variant.prices?.length > 0) {
                  variant.prices.forEach((price: any) => {
                    const effectivePrice = price.saleAmount ?? price.amount;
                    if (
                      typeof effectivePrice === "number" &&
                      !isNaN(effectivePrice)
                    ) {
                      prices.push(effectivePrice);
                    }
                  });
                }
              });
            }

            if (prices.length === 0 && product.prices?.length > 0) {
              product.prices.forEach((price: any) => {
                const effectivePrice = price.saleAmount ?? price.amount;
                if (
                  typeof effectivePrice === "number" &&
                  !isNaN(effectivePrice)
                ) {
                  prices.push(effectivePrice);
                }
              });
            }

            return prices.length > 0 ? Math.min(...prices) : Infinity;
          };

          products = products.sort((a, b) => {
            const priceA = getMinPrice(a);
            const priceB = getMinPrice(b);
            return sort === "price" ? priceA - priceB : priceB - priceA;
          });
        }

        const totalPages = Math.ceil(totalDocs / limit);

        return {
          docs: products,
          totalDocs,
          page,
          limit,
          totalPages,
          pagingCounter: skip + 1,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
        };
      } catch (error) {
        console.log("Error in products list query:", error);
        throw error;
      }
    }),
});
