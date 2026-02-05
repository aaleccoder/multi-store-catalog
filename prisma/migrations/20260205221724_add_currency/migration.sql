/*
  Warnings:

  - You are about to drop the column `storeId` on the `Currency` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Currency" DROP CONSTRAINT "Currency_storeId_fkey";

-- DropIndex
DROP INDEX "Currency_storeId_code_key";

-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "storeId";

-- CreateTable
CREATE TABLE "StoreCurrency" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCurrency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreCurrency_storeId_idx" ON "StoreCurrency"("storeId");

-- CreateIndex
CREATE INDEX "StoreCurrency_currencyId_idx" ON "StoreCurrency"("currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCurrency_storeId_currencyId_key" ON "StoreCurrency"("storeId", "currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- AddForeignKey
ALTER TABLE "StoreCurrency" ADD CONSTRAINT "StoreCurrency_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCurrency" ADD CONSTRAINT "StoreCurrency_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
