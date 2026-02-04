import { router, protectedProcedure } from "../../trpc";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { uploadFile, deleteFile, minioClient, BUCKET_NAME } from "@/lib/minio";
import { TRPCError } from "@trpc/server";
import { ErrorCode, createErrorWithCode } from "@/lib/error-codes";
import { Role } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

const resolveStoreId = async (
  storeId: string | undefined,
  storeSlug: string | undefined,
  userId: string,
  activeStoreId?: string,
) => {
  if (storeId) return storeId;
  if (storeSlug) return await getStoreIdFromSlug(storeSlug, userId);
  if (activeStoreId) {
    const store = await prisma.store.findFirst({
      where: { id: activeStoreId, ownerId: userId },
    });
    if (store) return store.id;
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (!store) {
    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
      message: "Store not found for this user",
    });
  }
  return store.id;
};

const getStoreIdFromSlug = async (slug: string, userId: string) => {
  const store = await prisma.store.findFirst({
    where: { slug, ownerId: userId },
  });
  if (!store) {
    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
      message: "Store not found for this user",
    });
  }
  return store.id;
};

const ensureStoreAccess = async (
  storeId: string,
  userId: string,
  role?: string | null,
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

const ensureMediaAccess = async (
  mediaId: string,
  userId: string,
  role?: string | null,
) => {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      product: { select: { id: true, name: true, slug: true, storeId: true } },
      productVariant: { select: { id: true, product: { select: { storeId: true } } } },
    },
  });

  if (!media) {
    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
      message: "Media not found",
      details: { resource: "media", id: mediaId },
    });
  }

  const storeId =
    media.product?.storeId ?? media.productVariant?.product?.storeId ?? null;

  if (!storeId) {
    if (role === Role.ADMIN) return media;
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this media",
    });
  }

  await ensureStoreAccess(storeId, userId, role);
  return media;
};

export const adminMediaRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          storeId: z.string().optional(),
          storeSlug: z.string().optional(),
          page: z.number().optional(),
          limit: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const skip = (page - 1) * limit;

      const storeId = await resolveStoreId(
        input?.storeId,
        input?.storeSlug,
        ctx.session.user.id,
        ctx.activeStoreId,
      );

      await ensureStoreAccess(storeId, ctx.session.user.id, ctx.session.user.role);

      const where: Prisma.MediaWhereInput = {
        OR: [
          { product: { is: { storeId } } },
          { productVariant: { is: { product: { is: { storeId } } } } },
        ],
      };

      const [media, totalDocs] = await Promise.all([
        prisma.media.findMany({ where, skip, take: limit, orderBy: { id: "desc" } }),
        prisma.media.count({ where }),
      ]);

      return {
        docs: media,
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit),
      };
    }),

  get: protectedProcedure.input(z.string()).query(async ({ input: id, ctx }) => {
    const media = await ensureMediaAccess(id, ctx.session.user.id, ctx.session.user.role);

    const objectName = media.url.split("/").pop();
    if (!objectName)
      throw new Error("Could not determine object name from URL");

    try {
      const stat = await minioClient.statObject(BUCKET_NAME, objectName);
      return { ...media, stat };
    } catch (error) {
      console.error("Error getting object stat:", error);
      // If stat fails, just return media. The object might be missing from storage.
      return { ...media, stat: null };
    }
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), alt: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, alt } = input;

      await ensureMediaAccess(id, ctx.session.user.id, ctx.session.user.role);

      const media = await prisma.media.update({
        where: { id },
        data: { alt },
      });
      return media;
    }),

  upload: protectedProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        storeSlug: z.string().optional(),
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        alt: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const storeId = await resolveStoreId(
        input.storeId,
        input.storeSlug,
        ctx.session.user.id,
        ctx.activeStoreId,
      );
      await ensureStoreAccess(storeId, ctx.session.user.id, ctx.session.user.role);

      const buffer = Buffer.from(input.fileBase64, "base64");
      const url = await uploadFile(buffer, input.fileName, input.mimeType);

      const media = await prisma.media.create({
        data: { url, alt: input.alt ?? input.fileName },
      });
      return media;
    }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    try {
      const id = input;

      const media = await ensureMediaAccess(id, ctx.session.user.id, ctx.session.user.role);

      // Check if the media is associated with a product
      if (media.productId) {
        throw createErrorWithCode(ErrorCode.RESOURCE_IN_USE, {
          message:
            "La multimedia está asociada a un producto y no se puede eliminar.",
          details: {
            resource: "media",
            linkedTo: "product",
            productId: media.productId,
          },
        });
      }

      const fileName = media.url.split("/").pop();
      if (fileName) await deleteFile(fileName);
      await prisma.media.delete({ where: { id } });
      return { success: true };
    } catch (error: any) {
      // If it's already a TRPCError (one we created), rethrow it
      if (error instanceof TRPCError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in media.delete:", error);
      throw createErrorWithCode(ErrorCode.SERVER_ERROR);
    }
  }),
});
