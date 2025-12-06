/*
  Warnings:

  - A unique constraint covering the columns `[storeId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,code]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,name]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Currency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Currency_code_key";

-- DropIndex
DROP INDEX "Product_slug_key";

-- DropIndex
DROP INDEX "Subcategory_slug_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_name_key" ON "Category"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_storeId_code_key" ON "Currency"("storeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_storeId_key" ON "Settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_storeId_slug_key" ON "Subcategory"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_storeId_name_key" ON "Subcategory"("storeId", "name");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
