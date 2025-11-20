-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "productVariantId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "description" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "specifications" JSONB;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
