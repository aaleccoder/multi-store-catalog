-- CreateTable
CREATE TABLE "StoreCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreCategoryAssignment" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "storeCategoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreCategoryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreCategory_name_key" ON "StoreCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCategory_slug_key" ON "StoreCategory"("slug");

-- CreateIndex
CREATE INDEX "StoreCategoryAssignment_storeId_idx" ON "StoreCategoryAssignment"("storeId");

-- CreateIndex
CREATE INDEX "StoreCategoryAssignment_storeCategoryId_idx" ON "StoreCategoryAssignment"("storeCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCategoryAssignment_storeId_storeCategoryId_key" ON "StoreCategoryAssignment"("storeId", "storeCategoryId");

-- AddForeignKey
ALTER TABLE "StoreCategoryAssignment" ADD CONSTRAINT "StoreCategoryAssignment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCategoryAssignment" ADD CONSTRAINT "StoreCategoryAssignment_storeCategoryId_fkey" FOREIGN KEY ("storeCategoryId") REFERENCES "StoreCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default store categories
INSERT INTO "StoreCategory" ("id", "name", "slug", "description", "icon") VALUES
  (gen_random_uuid()::text, 'General', 'general', 'Tiendas de productos y servicios generales', '🏪'),
  (gen_random_uuid()::text, 'Electrónica', 'electronica', 'Dispositivos, gadgets y accesorios electrónicos', '📱'),
  (gen_random_uuid()::text, 'Moda y Accesorios', 'moda-accesorios', 'Ropa, calzado y complementos', '👗'),
  (gen_random_uuid()::text, 'Hogar y Decoración', 'hogar-decoracion', 'Muebles, decoración y artículos para el hogar', '🏠'),
  (gen_random_uuid()::text, 'Alimentos y Bebidas', 'alimentos-bebidas', 'Productos alimenticios y bebidas', '🍕'),
  (gen_random_uuid()::text, 'Salud y Belleza', 'salud-belleza', 'Productos de salud, cuidado personal y belleza', '💄'),
  (gen_random_uuid()::text, 'Deportes y Fitness', 'deportes-fitness', 'Equipamiento deportivo y fitness', '⚽'),
  (gen_random_uuid()::text, 'Libros y Papelería', 'libros-papeleria', 'Libros, material escolar y de oficina', '📚'),
  (gen_random_uuid()::text, 'Juguetes y Bebés', 'juguetes-bebes', 'Juguetes, productos infantiles y para bebés', '🧸'),
  (gen_random_uuid()::text, 'Arte y Manualidades', 'arte-manualidades', 'Materiales de arte, craft y creatividad', '🎨'),
  (gen_random_uuid()::text, 'Automotriz', 'automotriz', 'Repuestos, accesorios y productos para vehículos', '🚗'),
  (gen_random_uuid()::text, 'Mascotas', 'mascotas', 'Productos y accesorios para mascotas', '🐾'),
  (gen_random_uuid()::text, 'Joyería', 'joyeria', 'Joyas, relojes y accesorios de lujo', '💎'),
  (gen_random_uuid()::text, 'Música e Instrumentos', 'musica-instrumentos', 'Instrumentos musicales y accesorios', '🎵'),
  (gen_random_uuid()::text, 'Servicios', 'servicios', 'Servicios profesionales y especializados', '🛠️');

-- Assign "General" category to all existing stores
INSERT INTO "StoreCategoryAssignment" ("id", "storeId", "storeCategoryId")
SELECT 
  gen_random_uuid()::text,
  "Store"."id",
  (SELECT "id" FROM "StoreCategory" WHERE "slug" = 'general')
FROM "Store";
