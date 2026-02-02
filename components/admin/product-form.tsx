"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Editor } from "@/components/ui/editor";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Loader2, Plus, Trash2, Star } from "lucide-react";
import type { Currency } from "@/lib/currency-client";
import Image from "next/image";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { trpc } from "@/trpc/client";
import { ProductInput, Specifications } from "@/lib/api-validators";
import { ProductVariantsForm, Variant } from "./product-variants-form";
import { createNumberInputHandlers } from "@/lib/number-input";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

type ProductFormData = Omit<ProductInput, "coverImages" | "specifications"> & {
  coverImages: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
    isUploaded: boolean;
    file?: File;
  }>;
  specifications: Specifications;
  variants: Variant[];
  hasVariants: boolean;
};

interface PriceInput {
  price: number;
  salePrice?: number | null;
  currency: string;
  isDefault?: boolean;
  taxIncluded?: boolean;
}

interface ProductFormProps {
  productId?: string;
  storeSlug?: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const sanitizeSlugInput = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
};

export function ProductForm({ productId, storeSlug }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    subcategoryId: "",
    coverImages: [],
    prices: [],
    specifications: {},
    isActive: true,
    inStock: true,
    featured: false,
    variants: [],
    hasVariants: false,
  });

  const { data: productData, isLoading: productLoading } =
    trpc.admin.products.get.useQuery(
      { id: productId || "" },
      {
        enabled: !!productId,
      },
    );

  const { data: categoriesData, isLoading: categoriesLoading } =
    trpc.admin.categories.list.useQuery(undefined, { enabled: true });
  const { data: subcategoriesData, isLoading: subcategoriesLoading } =
    trpc.admin.subcategories.list.useQuery(undefined, { enabled: true });
  const { data: currenciesData, isLoading: currenciesLoading } =
    trpc.admin.currencies.list.useQuery(undefined, { enabled: true });

  const utils = trpc.useUtils();

  const loading =
    productLoading ||
    categoriesLoading ||
    subcategoriesLoading ||
    currenciesLoading;

  const categories = useMemo<Category[]>(() => {
    if (productData?.categories) return productData.categories as Category[];
    return (categoriesData as Category[]) || [];
  }, [productData?.categories, categoriesData]);

  const subcategories = useMemo<Subcategory[]>(() => {
    const allSubs =
      (productData?.subcategories as Subcategory[]) ??
      (subcategoriesData as Subcategory[]) ??
      [];
    if (formData.categoryId) {
      return allSubs.filter((sub) => sub.categoryId === formData.categoryId);
    }
    return [];
  }, [productData?.subcategories, subcategoriesData, formData.categoryId]);

  const currencies = useMemo<Currency[]>(() => {
    if (productData?.currencies) return productData.currencies as Currency[];
    return (currenciesData as Currency[]) || [];
  }, [productData?.currencies, currenciesData]);

  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription || "",
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || "",
        coverImages: (product.coverImages || []).map((img, index) => ({
          ...img,
          isUploaded: true,
          isPrimary: index === 0,
        })),
        prices: (product.prices || []).map((p) => ({
          price: Number(p.amount ?? 0),
          salePrice: p.saleAmount ?? undefined,
          currency: p.currency?.code || "",
          isDefault:
            (product.prices || []).length === 1 ? true : (p.isDefault ?? false),
          taxIncluded: p.taxIncluded ?? true,
        })),
        specifications: (product as any).specifications || {},
        isActive: product.isActive,
        inStock: product.inStock,
        featured: product.featured,
        variants: (product.variants || []).map<Variant>((v) => {
          const specs = (v as { specifications?: unknown }).specifications;

          return {
            id: v.id,
            name: v.name,
            sku: v.sku ?? undefined,
            stock: v.stock ?? 0,
            isActive: v.isActive ?? true,
            description: v.description ?? undefined,
            shortDescription: v.shortDescription ?? undefined,
            ...(specs ? { specifications: specs as Specifications } : {}),
            coverImages: (v.images || []).map((img, index) => ({
              url: img.url,
              alt: img.alt || "",
              isUploaded: true,
              isPrimary: index === 0,
            })),
            prices: (v.prices || []).map((p) => ({
              price: Number(p.amount ?? 0),
              salePrice:
                p.saleAmount != null ? Number(p.saleAmount) : undefined,
              currency: p.currency?.code || "",
              isDefault: p.isDefault ?? false,
              taxIncluded: p.taxIncluded ?? true,
            })),
          };
        }),
        hasVariants: (product.variants || []).length > 0,
      });
      setManuallyEditedSlug(product.slug !== generateSlug(product.name));
    }
  }, [productData]);

  const createProductMutation = trpc.admin.products.create.useMutation();
  const updateProductMutation = trpc.admin.products.update.useMutation();
  const createCategoryMutation = trpc.admin.categories.create.useMutation();
  const createSubcategoryMutation = trpc.admin.subcategories.create.useMutation();
  const createCurrencyMutation = trpc.admin.currencies.create.useMutation();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newCurrencyData, setNewCurrencyData] = useState({
    name: "",
    code: "",
    symbol: "",
  });

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Por favor ingresa un nombre para la categoría");
      return;
    }

    const slug = generateSlug(newCategoryName);
    try {
      const category = await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        slug,
        storeSlug,
      });
      setFormData({ ...formData, categoryId: category.id, subcategoryId: "" });
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      toast.success("Categoría creada exitosamente");
      void utils.admin.categories.list.invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      toast.error("Por favor ingresa un nombre para la subcategoría");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Por favor selecciona una categoría primero");
      return;
    }

    const slug = generateSlug(newSubcategoryName);
    try {
      const subcategory = await createSubcategoryMutation.mutateAsync({
        name: newSubcategoryName,
        slug,
        categoryId: formData.categoryId,
        storeSlug,
      });
      setFormData({ ...formData, subcategoryId: subcategory.id });
      setNewSubcategoryName("");
      setSubcategoryDialogOpen(false);
      toast.success("Subcategoría creada exitosamente");
      void utils.admin.subcategories.list.invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    }
  };

  const handleCreateCurrency = async () => {
    if (!newCurrencyData.name.trim() || !newCurrencyData.code.trim() || !newCurrencyData.symbol.trim()) {
      toast.error("Por favor completa todos los campos de la moneda");
      return;
    }

    try {
      const currency = await createCurrencyMutation.mutateAsync({
        name: newCurrencyData.name,
        code: newCurrencyData.code.toUpperCase(),
        symbol: newCurrencyData.symbol,
        storeSlug,
      });
      setNewCurrencyData({ name: "", code: "", symbol: "" });
      setCurrencyDialogOpen(false);
      toast.success("Moneda creada exitosamente");
      void utils.admin.currencies.list.invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file, idx) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isPrimary: formData.coverImages.length === 0 && idx === 0,
      isUploaded: false,
      file,
    }));

    setFormData({
      ...formData,
      coverImages: [...formData.coverImages, ...newImages],
    });
  };

  const removeImage = (index: number) => {
    const img = formData.coverImages[index];
    if (!img.isUploaded) {
      URL.revokeObjectURL(img.url);
    }
    const newImages = formData.coverImages.filter((_, i) => i !== index);
    if (img.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setFormData({ ...formData, coverImages: newImages });
  };

  const setPrimaryImage = (index: number) => {
    const newImages = formData.coverImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setFormData({ ...formData, coverImages: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    let savingToastId: string | number | undefined;

    try {
      let updatedCoverImages = formData.coverImages;
      const pendingImages = formData.coverImages.filter(
        (img) => !img.isUploaded,
      );
      if (pendingImages.length > 0) {
        let uploadToastId: string | number | undefined;
        try {
          uploadToastId = toast.loading("Uploading images...");
          const uploadPromises = pendingImages.map(async (img) => {
            const formDataToUpload = new FormData();
            formDataToUpload.append("file", img.file!);
            formDataToUpload.append("alt", img.alt);

            const res = await fetch("/api/admin/media", {
              method: "POST",
              body: formDataToUpload,
            });

            const media = await res.json();
            return { ...img, url: media.url, alt: media.alt, isUploaded: true };
          });

          const uploadedImages = await Promise.all(uploadPromises);
          updatedCoverImages = formData.coverImages.map((img) => {
            const uploaded = uploadedImages.find((u) => u.file === img.file);
            return uploaded || img;
          });

          pendingImages.forEach((img) => URL.revokeObjectURL(img.url));
          toast.success("Imágenes subidas", { id: uploadToastId });
        } catch (uploadError) {
          toast.error(getErrorMessage(uploadError), { id: uploadToastId });
          setSaving(false);
          return;
        }
      }

      const primaryImage = updatedCoverImages.find((img) => img.isPrimary);
      const otherImages = updatedCoverImages.filter((img) => !img.isPrimary);
      const orderedImages = primaryImage
        ? [primaryImage, ...otherImages]
        : otherImages;

      const submitData = {
        ...formData,
        coverImages: orderedImages.map((img) => ({
          url: img.url,
          alt: img.alt,
        })),
        specifications: {
          ...(formData.specifications || {}),
          weightUnit: formData.specifications?.weightUnit || "g",
          volumeUnit: formData.specifications?.volumeUnit || "ml",
          dimensions: {
            ...(formData.specifications?.dimensions || {}),
            unit: formData.specifications?.dimensions?.unit || "cm",
          },
        },
      };

      if (submitData.prices && submitData.prices.length > 0) {
        (submitData as any).prices = (submitData.prices as PriceInput[]).map(
          (p) => ({
            price: p.price,
            salePrice: p.salePrice ?? null,
            currency: p.currency,
            isDefault: p.isDefault ?? false,
            taxIncluded: p.taxIncluded ?? true,
          }),
        );
      }

      if (submitData.hasVariants) {
        const processedVariants = await Promise.all(
          submitData.variants.map(async (v) => {
            let variantImages = v.coverImages || [];
            const pendingVariantImages = variantImages.filter(
              (img) => !img.isUploaded,
            );

            if (pendingVariantImages.length > 0) {
              const uploadPromises = pendingVariantImages.map(async (img) => {
                const formDataToUpload = new FormData();
                formDataToUpload.append("file", img.file!);
                formDataToUpload.append("alt", img.alt);

                const res = await fetch("/api/admin/media", {
                  method: "POST",
                  body: formDataToUpload,
                });

                if (!res.ok) throw new Error("Failed to upload variant image");

                const media = await res.json();
                return {
                  ...img,
                  url: media.url,
                  alt: media.alt,
                  isUploaded: true,
                };
              });

              const uploadedImages = await Promise.all(uploadPromises);
              variantImages = variantImages.map((img) => {
                const uploaded = uploadedImages.find(
                  (u) => u.file === img.file,
                );
                return uploaded || img;
              });

              pendingVariantImages.forEach((img) =>
                URL.revokeObjectURL(img.url),
              );
            }

            const primaryImage = variantImages.find((img) => img.isPrimary);
            const otherImages = variantImages.filter((img) => !img.isPrimary);
            const orderedImages = primaryImage
              ? [primaryImage, ...otherImages]
              : otherImages;

            return {
              id: v.id,
              name: v.name,
              sku: v.sku,
              stock: v.stock,
              isActive: v.isActive,
              attributes: v.attributes,
              image: v.image,
              description: v.description,
              shortDescription: v.shortDescription,
              specifications: v.specifications,
              coverImages: orderedImages.map((img) => ({
                url: img.url,
                alt: img.alt,
              })),
              prices: v.prices?.map((p) => ({
                price: p.price,
                salePrice: p.salePrice ?? null,
                currency: p.currency,
                isDefault: p.isDefault ?? false,
                taxIncluded: p.taxIncluded ?? true,
              })),
            };
          }),
        );
        (submitData as any).variants = processedVariants;
      } else {
        (submitData as any).variants = [];
      }

      savingToastId = toast.loading("Guardando producto...");

      if (productId) {
        await updateProductMutation.mutateAsync({
          id: productId,
          data: submitData as any,
        });
      } else {
        await createProductMutation.mutateAsync(submitData as any);
      }

      toast.success("Producto guardado", { id: savingToastId });
      const basePath = storeSlug
        ? `/admin/stores/${storeSlug}`
        : "/admin/stores";
      router.push(`${basePath}/products`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: savingToastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className=" pt-20 lg:pt-0">
          <div className="p-8 flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className=" pt-20 lg:pt-0">
        <div className="md:p-8 md:max-w-4xl p-2 mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {productId ? "Editar Producto" : "Crear Producto"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: manuallyEditedSlug
                          ? formData.slug
                          : generateSlug(name),
                      });
                    }}
                    required
                    aria-required={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Requerido — usado para listados de productos y SEO. Un buen
                    nombre ayuda a las conversiones.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setManuallyEditedSlug(false);
                        setFormData({
                          ...formData,
                          slug: generateSlug(formData.name),
                        });
                      } else {
                        setManuallyEditedSlug(true);
                        setFormData({
                          ...formData,
                          slug: sanitizeSlugInput(value),
                        });
                      }
                    }}
                    required
                    aria-required={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Requerido — slug único usado en URLs de productos,
                    auto-generado desde el nombre cuando está vacío.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Descripción Corta</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value.slice(0, 150),
                      })
                    }
                    rows={2}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.shortDescription?.length}/150 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Editor
                    value={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                    placeholder="Escribe una descripción detallada del producto..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Requerido — una descripción completa ayuda a los clientes y
                    motores de búsqueda. Usa el editor de texto enriquecido para
                    dar formato.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Variantes de Producto</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hasVariants">¿Tiene variantes?</Label>
                    <Switch
                      id="hasVariants"
                      checked={formData.hasVariants}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasVariants: checked })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Activa esto si el producto tiene múltiples opciones (ej.
                  tallas, colores) con diferentes precios o stock.
                </p>
              </CardHeader>
              {formData.hasVariants && (
                <CardContent>
                  <ProductVariantsForm
                    variants={formData.variants}
                    onChange={(variants) =>
                      setFormData({ ...formData, variants })
                    }
                    currencies={currencies}
                    storeSlug={storeSlug}
                  />
                </CardContent>
              )}
            </Card>

            {!formData.hasVariants && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Precios (múltiples monedas)</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrencyDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nueva Moneda
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agrega precios para todas las monedas que soportas. Un
                    precio debe marcarse como predeterminado para la moneda
                    principal.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.prices ?? []).map((p, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end p-4 rounded-lg border ${p.isDefault ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="space-y-2">
                        <Label>Moneda</Label>
                        <Select
                          value={p.currency || currencies[0]?.code || "USD"}
                          onValueChange={(value) => {
                            const newPrices = [...(formData.prices || [])];
                            newPrices[idx] = {
                              ...newPrices[idx],
                              currency: value,
                            };
                            setFormData({ ...formData, prices: newPrices });
                          }}
                          aria-busy={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            {loading ? (
                              <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando monedas...
                              </div>
                            ) : currencies.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No hay monedas disponibles. Crea una nueva moneda.
                              </div>
                            ) : (
                              currencies.map((c) => (
                                <SelectItem key={c.id} value={c.code}>
                                  {c.symbol} {c.code} - {c.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Precio</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.price || ""}
                          {...createNumberInputHandlers({
                            onChange: (value) => {
                              const newPrices = [...(formData.prices || [])];
                              newPrices[idx] = {
                                ...newPrices[idx],
                                price: value === "" ? 0 : (value as number),
                              };
                              setFormData({ ...formData, prices: newPrices });
                            },
                            defaultValue: 0,
                            parseType: 'float',
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Precio de Venta</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.salePrice ?? ""}
                          {...createNumberInputHandlers({
                            onChange: (value) => {
                              const newPrices = [...(formData.prices || [])];
                              newPrices[idx] = {
                                ...newPrices[idx],
                                salePrice: value === "" ? undefined : (value as unknown as number),
                              };
                              setFormData({ ...formData, prices: newPrices });
                            },
                            defaultValue: null,
                            parseType: 'float',
                          })}
                        />
                      </div>

                      <div className="space-y-2 hidden">
                        <Label>Impuesto Incluido</Label>
                        <Switch
                          checked={p.taxIncluded ?? true}
                          onCheckedChange={(checked) => {
                            const newPrices = [...(formData.prices || [])];
                            newPrices[idx] = {
                              ...newPrices[idx],
                              taxIncluded: checked,
                            };
                            setFormData({ ...formData, prices: newPrices });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Predeterminado</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={p.isDefault ? "default" : "outline"}
                            disabled={p.isDefault}
                            onClick={() => {
                              const newPrices = (formData.prices || []).map(
                                (x, i) => ({ ...x, isDefault: i === idx }),
                              );
                              setFormData({ ...formData, prices: newPrices });
                            }}
                          >
                            {p.isDefault ? "Predeterminado" : "Establecer"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const newPrices = (formData.prices || []).filter(
                                (_, i) => i !== idx,
                              );
                              if (newPrices.length === 1) {
                                newPrices[0] = {
                                  ...newPrices[0],
                                  isDefault: true,
                                };
                              }
                              setFormData({ ...formData, prices: newPrices });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <Button
                      type="button"
                      onClick={() => {
                        const defaultCurrency = currencies[0]?.code || "USD";
                        const newPrices = [
                          ...(formData.prices || []),
                          {
                            price: 0,
                            salePrice: undefined,
                            currency: defaultCurrency,
                            isDefault: (formData.prices?.length ?? 0) === 0,
                            taxIncluded: true,
                          },
                        ];
                        setFormData({ ...formData, prices: newPrices });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Agregar Precio
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Consejo: Agrega precios localizados para cada moneda que
                      soportas. Marca uno como predeterminado. Puedes agregar
                      más de uno por moneda para diferentes puntos de precio.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categoría</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva Categoría
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <p className="text-xs text-muted-foreground">
                      Opcional - esto ayuda a los clientes a encontrar tu
                      producto.
                    </p>
                    <Select
                      key={`category-${formData.categoryId}`}
                      value={formData.categoryId || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          categoryId: value === "none" ? "" : value,
                          subcategoryId: "",
                        })
                      }
                      aria-busy={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {loading ? (
                          <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cargando categorías...
                          </div>
                        ) : categories.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No hay categorías. Crea una nueva.
                          </div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subcategory">Subcategoría</Label>
                      {formData.categoryId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSubcategoryDialogOpen(true)}
                          className="h-auto py-1 px-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Nueva
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional - elige una categoría más específica si aplica.
                    </p>
                    <Select
                      key={`subcategory-${formData.categoryId}-${formData.subcategoryId}`}
                      value={formData.subcategoryId || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          subcategoryId: value === "none" ? "" : value,
                        })
                      }
                      disabled={!formData.categoryId}
                      aria-busy={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {loading ? (
                          <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cargando subcategorías...
                          </div>
                        ) : (
                          subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.coverImages.map((img, index) =>
                    img.url ? (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-border">
                          <Image
                            src={img.url}
                            alt={img.alt || "Product image"}
                            fill
                            className="object-cover"
                          />
                          {img.isPrimary && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 justify-center">
                          {!img.isPrimary && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryImage(index)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null,
                  )}

                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Agregar Imágenes
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="block sm:hidden text-xs text-muted-foreground mt-2 text-center">
                      Consejo: Sube hasta múltiples imágenes, marca una como
                      principal después.
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={(formData.specifications || {}).sku || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...(formData.specifications || {}),
                          sku: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    placeholder="ej. 6 unidades, 1 paquete"
                    value={(formData.specifications || {}).unit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...(formData.specifications || {}),
                          unit: e.target.value,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional - cantidad que trae el producto (ej. 6 unidades)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={(formData.specifications || {}).weight || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...(formData.specifications || {}),
                            weight: e.target.value
                              ? Math.max(0, parseFloat(e.target.value))
                              : undefined,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unidad de Peso</Label>
                    <Select
                      value={(formData.specifications || {}).weightUnit || "g"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...(formData.specifications || {}),
                            weightUnit: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volumen</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.01"
                      min="0"
                      value={(formData.specifications || {}).volume || ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : undefined;
                        setFormData({
                          ...formData,
                          specifications: {
                            ...(formData.specifications || {}),
                            volume:
                              value !== undefined && value < 0
                                ? undefined
                                : value,
                          },
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unidad de Volumen</Label>
                    <Select
                      value={(formData.specifications || {}).volumeUnit || "ml"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          specifications: {
                            ...(formData.specifications || {}),
                            volumeUnit: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="fl oz">fl oz</SelectItem>
                        <SelectItem value="gal">gal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dimensiones</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Largo</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          (formData.specifications || {}).dimensions?.length ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          setFormData({
                            ...formData,
                            specifications: {
                              ...(formData.specifications || {}),
                              dimensions: {
                                ...(formData.specifications?.dimensions || {}),
                                length:
                                  value !== undefined && value < 0
                                    ? undefined
                                    : value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Ancho</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          (formData.specifications || {}).dimensions?.width ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          setFormData({
                            ...formData,
                            specifications: {
                              ...(formData.specifications || {}),
                              dimensions: {
                                ...(formData.specifications?.dimensions || {}),
                                width:
                                  value !== undefined && value < 0
                                    ? undefined
                                    : value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Alto</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          (formData.specifications || {}).dimensions?.height ||
                          ""
                        }
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          setFormData({
                            ...formData,
                            specifications: {
                              ...(formData.specifications || {}),
                              dimensions: {
                                ...(formData.specifications?.dimensions || {}),
                                height:
                                  value !== undefined && value < 0
                                    ? undefined
                                    : value,
                              },
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidad</Label>
                      <Select
                        value={
                          (formData.specifications || {}).dimensions?.unit ||
                          "cm"
                        }
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            specifications: {
                              ...(formData.specifications || {}),
                              dimensions: {
                                ...(formData.specifications?.dimensions || {}),
                                unit: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mm">mm</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="ft">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, inStock: checked })
                    }
                  />
                  <Label htmlFor="inStock">En Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Destacado</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving
                  ? "Guardando..."
                  : productId
                    ? "Actualizar Producto"
                    : "Crear Producto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Categoría</DialogTitle>
            <DialogDescription>
              Ingresa el nombre de la categoría. El slug se generará automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Nombre</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej: Electrónica"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Crear Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Subcategoría</DialogTitle>
            <DialogDescription>
              {formData.categoryId
                ? `Se creará una subcategoría para la categoría seleccionada.`
                : "Por favor selecciona una categoría primero."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-subcategory-name">Nombre</Label>
              <Input
                id="new-subcategory-name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Ej: Smartphones"
                disabled={!formData.categoryId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSubcategory}
              disabled={createSubcategoryMutation.isPending || !formData.categoryId}
            >
              {createSubcategoryMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Crear Subcategoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Moneda</DialogTitle>
            <DialogDescription>
              Ingresa los detalles de la moneda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-currency-name">Nombre</Label>
              <Input
                id="new-currency-name"
                value={newCurrencyData.name}
                onChange={(e) => setNewCurrencyData({ ...newCurrencyData, name: e.target.value })}
                placeholder="Ej: Dólar Estadounidense"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-currency-code">Código (ISO)</Label>
              <Input
                id="new-currency-code"
                value={newCurrencyData.code}
                onChange={(e) => setNewCurrencyData({ ...newCurrencyData, code: e.target.value })}
                placeholder="Ej: USD"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-currency-symbol">Símbolo</Label>
              <Input
                id="new-currency-symbol"
                value={newCurrencyData.symbol}
                onChange={(e) => setNewCurrencyData({ ...newCurrencyData, symbol: e.target.value })}
                placeholder="Ej: $"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrencyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCurrency}
              disabled={createCurrencyMutation.isPending}
            >
              {createCurrencyMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Crear Moneda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
