-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "filters" JSONB[],

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "filters" JSONB[],
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "coverImages" JSONB[],
    "pricing" JSONB NOT NULL,
    "specifications" JSONB NOT NULL,
    "filterValues" JSONB[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB[],
    "metaData" JSONB NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "symbolPosition" TEXT NOT NULL DEFAULT 'before',
    "decimalSeparator" TEXT NOT NULL,
    "thousandsSeparator" TEXT NOT NULL,
    "decimalPlaces" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
