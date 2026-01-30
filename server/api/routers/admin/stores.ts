import { router, protectedProcedure } from "../../trpc";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  ErrorCode,
  createErrorWithCode,
  mapPrismaError,
} from "@/lib/error-codes";
import { generateSlug, sanitizeSlugInput } from "@/lib/utils";
import { defaultStoreTheme } from "@/lib/theme";
import { Role } from "@/generated/prisma/enums";

const storeSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  theme: z
    .object({
      light: z.record(z.string(), z.string()).optional(),
      dark: z.record(z.string(), z.string()).optional(),
      branding: z
        .object({
          logoUrl: z.string().min(1).optional(),
          logoAlt: z.string().optional(),
          logoWidth: z.number().optional(),
          logoHeight: z.number().optional(),
        })
        .optional(),
      fontId: z.string().optional(),
    })
    .optional(),
});

const updateSchema = z.object({
  id: z.string(),
  data: storeSchema.partial().optional(),
});

const normalizeSlug = (value: string | undefined, fallback: string) => {
  if (value && value.trim()) {
    return sanitizeSlugInput(value);
  }
  return generateSlug(fallback);
};

const ensureOwnerAccess = async (
  storeId: string,
  userId: string,
  role?: Role | string | null,
) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
      message: "Store not found",
    });
  }

  if (store.ownerId !== userId && role !== Role.ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this store",
    });
  }

  return store;
};

export const adminStoresRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.store.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }),

  getBySlug: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const store = await prisma.store.findFirst({
        where: { slug: input },
      });
      if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
          message: "Store not found",
        });
      }
      if (
        store.ownerId !== ctx.session.user.id &&
        ctx.session.user.role !== Role.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this store",
        });
      }
      return store;
    }),

  create: protectedProcedure
    .input(storeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const storeCount = await prisma.store.count({
          where: { ownerId: ctx.session.user.id },
        });
        if (storeCount >= 5) {
          throw createErrorWithCode(ErrorCode.STORE_LIMIT_EXCEEDED);
        }
        const slug = normalizeSlug(input.slug, input.name);
        const resolvedTheme = input.theme ?? {
          light: { ...defaultStoreTheme.light },
          dark: { ...defaultStoreTheme.dark },
          branding: { ...defaultStoreTheme.branding },
          fontId: defaultStoreTheme.fontId,
        };
        const store = await prisma.store.create({
          data: {
            name: input.name,
            slug,
            description: input.description,
            isActive: input.isActive ?? false,
            ownerId: ctx.session.user.id,
            theme: resolvedTheme,
          },
        });
        return store;
      } catch (error: any) {
        const prismaErrorCode = mapPrismaError(error);
        if (prismaErrorCode) {
          throw createErrorWithCode(prismaErrorCode);
        }

        if (error instanceof TRPCError) throw error;

        console.error("Unexpected error in stores.create:", error);
        throw createErrorWithCode(ErrorCode.SERVER_ERROR);
      }
    }),

  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      const patch = data ?? {};
      try {
        const existing = await ensureOwnerAccess(
          id,
          ctx.session.user.id,
          ctx.session.user.role as Role,
        );

        // Build an update payload only with fields provided in the input.
        // This avoids forcing the client to send every store field when updating.
        const updateData: any = {};

        if (patch.name !== undefined) {
          updateData.name = patch.name;
        }

        if (patch.name !== undefined || patch.slug !== undefined) {
          // If either name or slug is provided, compute the new slug.
          // If a slug is provided, sanitize it. Otherwise, generate from the name (or fall back to existing name).
          updateData.slug = normalizeSlug(
            patch.slug,
            patch.name ?? existing.name ?? "",
          );
        }

        if (patch.description !== undefined) {
          updateData.description = patch.description;
        }

        if (patch.isActive !== undefined) {
          updateData.isActive = patch.isActive;
        }

        if (patch.theme !== undefined) {
          const existingTheme = (existing.theme as any) ?? {};
          const incomingTheme = patch.theme ?? {};
          updateData.theme = {
            ...existingTheme,
            ...incomingTheme,
            light: {
              ...(existingTheme.light ?? {}),
              ...(incomingTheme.light ?? {}),
            },
            dark: {
              ...(existingTheme.dark ?? {}),
              ...(incomingTheme.dark ?? {}),
            },
            branding: {
              ...(existingTheme.branding ?? {}),
              ...(incomingTheme.branding ?? {}),
            },
            fontId: incomingTheme?.fontId ?? existingTheme?.fontId,
          };
        }

        // If there's nothing to update, return the existing store as-is.
        if (Object.keys(updateData).length === 0) {
          return existing;
        }

        const store = await prisma.store.update({
          where: { id },
          data: updateData,
        });
        return store;
      } catch (error: any) {
        const prismaErrorCode = mapPrismaError(error);
        if (prismaErrorCode) {
          throw createErrorWithCode(prismaErrorCode);
        }

        if (error instanceof TRPCError) throw error;

        console.error("Unexpected error in stores.update:", error);
        throw createErrorWithCode(ErrorCode.SERVER_ERROR);
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const store = await ensureOwnerAccess(
          input,
          ctx.session.user.id,
          ctx.session.user.role as Role,
        );

        await prisma.store.delete({ where: { id: store.id } });
        return { success: true };
      } catch (error: any) {
        const prismaErrorCode = mapPrismaError(error);
        if (prismaErrorCode) {
          throw createErrorWithCode(prismaErrorCode);
        }

        if (error instanceof TRPCError) throw error;

        console.error("Unexpected error in stores.delete:", error);
        throw createErrorWithCode(ErrorCode.SERVER_ERROR);
      }
    }),
});
