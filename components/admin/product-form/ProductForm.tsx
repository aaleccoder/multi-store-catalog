"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProductForm } from "./hooks/useProductForm";
import {
    useCreateCategory,
    useCreateSubcategory,
    useCreateCurrency,
} from "./hooks/useCreateDialogs";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { VariantsSection } from "./sections/VariantsSection";
import { PricingSection } from "./sections/PricingSection";
import { CategorySection } from "./sections/CategorySection";
import { ImagesSection } from "./sections/ImagesSection";
import { SpecificationsSection } from "./sections/SpecificationsSection";
import { StatusSection } from "./sections/StatusSection";
import {
    CreateCategoryDialog,
    CreateSubcategoryDialog,
    CreateCurrencyDialog,
} from "./dialogs/CreateResourceDialogs";
import type { ProductFormProps } from "./types";

export function ProductForm({ productId, storeSlug }: ProductFormProps) {
    const router = useRouter();

    const {
        formData,
        setFormData,
        saving,
        loading,
        categories,
        subcategories,
        currencies,
        manuallyEditedSlug,
        setManuallyEditedSlug,
        handleSubmit,
    } = useProductForm(productId, storeSlug);

    const categoryDialog = useCreateCategory(storeSlug);
    const subcategoryDialog = useCreateSubcategory(storeSlug);
    const currencyDialog = useCreateCurrency(storeSlug);

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData({ ...formData, ...data });
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
                        <BasicInfoSection
                            formData={formData}
                            onUpdate={updateFormData}
                            manuallyEditedSlug={manuallyEditedSlug}
                            onSlugEditChange={setManuallyEditedSlug}
                        />

                        <VariantsSection
                            formData={formData}
                            onUpdate={updateFormData}
                            currencies={currencies}
                            storeSlug={storeSlug}
                        />

                        {!formData.hasVariants && (
                            <PricingSection
                                formData={formData}
                                onUpdate={updateFormData}
                                currencies={currencies}
                                loading={loading}
                                onCreateCurrency={() => currencyDialog.setIsOpen(true)}
                            />
                        )}

                        <CategorySection
                            formData={formData}
                            onUpdate={updateFormData}
                            categories={categories}
                            subcategories={subcategories}
                            loading={loading}
                            onCreateCategory={() => categoryDialog.setIsOpen(true)}
                            onCreateSubcategory={() => subcategoryDialog.setIsOpen(true)}
                        />

                        <ImagesSection formData={formData} onUpdate={updateFormData} />

                        <SpecificationsSection
                            formData={formData}
                            onUpdate={updateFormData}
                        />

                        <StatusSection formData={formData} onUpdate={updateFormData} />

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

            <CreateCategoryDialog
                open={categoryDialog.isOpen}
                onOpenChange={categoryDialog.setIsOpen}
                name={categoryDialog.name}
                onNameChange={categoryDialog.setName}
                onConfirm={() =>
                    categoryDialog.handleCreate((categoryId) =>
                        updateFormData({ categoryId, subcategoryId: "" })
                    )
                }
                isLoading={categoryDialog.isLoading}
            />

            <CreateSubcategoryDialog
                open={subcategoryDialog.isOpen}
                onOpenChange={subcategoryDialog.setIsOpen}
                name={subcategoryDialog.name}
                onNameChange={subcategoryDialog.setName}
                onConfirm={() =>
                    subcategoryDialog.handleCreate(
                        formData.categoryId,
                        (subcategoryId) => updateFormData({ subcategoryId })
                    )
                }
                isLoading={subcategoryDialog.isLoading}
                hasCategorySelected={!!formData.categoryId}
            />

            <CreateCurrencyDialog
                open={currencyDialog.isOpen}
                onOpenChange={currencyDialog.setIsOpen}
                data={currencyDialog.data}
                onDataChange={currencyDialog.setData}
                onConfirm={currencyDialog.handleCreate}
                isLoading={currencyDialog.isLoading}
            />
        </div>
    );
}
