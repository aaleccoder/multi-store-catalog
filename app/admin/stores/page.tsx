"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminResource from "@/components/admin/admin-resource";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { generateSlug, sanitizeSlugInput } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Eye, Edit, Trash, MoreHorizontal, X } from "lucide-react";
import Header from "@/components/wholepage/Header";
import { trpc } from "@/trpc/client";

interface StoreFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

function StoreForm({ formData, setFormData }: StoreFormProps) {
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);
  const { data: storeCategories = [] } = trpc.admin.stores.listStoreCategories.useQuery();

  const selectedCategoryIds = formData.storeCategoryIds || [];

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategoryIds;
    const isSelected = current.includes(categoryId);

    if (isSelected) {
      // Remove category
      setFormData((prev: any) => ({
        ...prev,
        storeCategoryIds: current.filter((id: string) => id !== categoryId),
      }));
    } else {
      // Add category (up to 5)
      if (current.length < 5) {
        setFormData((prev: any) => ({
          ...prev,
          storeCategoryIds: [...current, categoryId],
        }));
      }
    }
  };

  // Keep slug in sync with name unless the user has manually edited the slug.
  // Use a functional setter and avoid depending on the whole `formData` object
  // to prevent infinite update loops when `setFormData` changes the object
  // identity but not the `name`.
  useEffect(() => {
    if (!formData.name) return;
    if (!manuallyEditedSlug) {
      const newSlug = generateSlug(formData.name);
      setFormData((prev: any) => {
        if (prev.slug === newSlug) return prev;
        return { ...prev, slug: newSlug };
      });
    }
  }, [formData.name, manuallyEditedSlug, setFormData]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={String(formData.name ?? "")}
          onChange={(e) => {
            const name = e.target.value;
            setFormData((prev: any) => ({
              ...prev,
              name,
              slug: manuallyEditedSlug ? prev.slug : generateSlug(name),
            }));
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={String(formData.slug ?? "")}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setManuallyEditedSlug(false);
              setFormData((prev: any) => ({
                ...prev,
                slug: generateSlug(prev.name || ""),
              }));
            } else {
              setManuallyEditedSlug(true);
              setFormData((prev: any) => ({
                ...prev,
                slug: sanitizeSlugInput(value),
              }));
            }
          }}
          required
        />
      </div>
      <div className="space-y-2 mt-10">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          value={String(formData.description ?? "")}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className="w-full border p-2"
        />
      </div>

      {/* Store Categories Selection */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Categorías de Tienda (máximo 5)</Label>
          <p className="text-sm text-muted-foreground">
            Selecciona hasta 5 categorías que describan tu tienda
          </p>
        </div>

        {/* Selected Categories */}
        {selectedCategoryIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategoryIds.map((categoryId: string) => {
              const category = storeCategories.find((c: any) => c.id === categoryId);
              if (!category) return null;
              return (
                <Badge
                  key={categoryId}
                  variant="default"
                  className="cursor-pointer hover:bg-destructive transition-colors"
                  onClick={() => toggleCategory(categoryId)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        )}

        {/* Available Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border p-3">
          {storeCategories.map((category: any) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            const isDisabled = !isSelected && selectedCategoryIds.length >= 5;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => !isDisabled && toggleCategory(category.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 p-2 border text-left text-sm transition-all
                  ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-muted'
                      : 'hover:bg-accent hover:border-accent-foreground/20'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="flex-1 truncate">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive ?? true}
          onCheckedChange={(val) =>
            setFormData((prev: any) => ({ ...prev, isActive: val }))
          }
        />
        <Label htmlFor="isActive">Activa</Label>
      </div>
    </div>
  );
}

export default function StoresPage() {
  const [storeToDelete, setStoreToDelete] = useState<any>(null);

  return (
    <div>
      <Header />
      <div>
        <main className="pt-20">
          <AdminResource
            title="Mis Tiendas"
            fetchUrl="/api/admin/stores"
            columns={[]}
            formFields={[
              { name: "isActive", label: "", type: "hidden", defaultValue: true },
            ]}
            renderForm={({ formData, setFormData }) => (
              <StoreForm formData={formData} setFormData={setFormData} />
            )}
            searchKeys={["name", "slug"]}
            newButtonLabel="Crear tienda"
            createEnabled={(items) => items.length < 5}
            createDisabledMessage="Has alcanzado el límite de 5 tiendas por usuario."
            renderList={(items, loading, onEdit, onDelete) => (
              <>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {loading && items.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Cargando tiendas...
                    </div>
                  )}
                  {!loading && items.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-lg font-medium">
                        No se encontraron tiendas
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Crea tu primera tienda para comenzar.
                      </p>
                    </div>
                  )}
                  {items.map((store: any) => (
                    <Card
                      key={store.id}
                      className="border-border/70 grid grid-cols-2 gap-4 p-4"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={
                            store.theme?.branding?.logoUrl ||
                            "/android-chrome-192x192.png"
                          }
                          alt={store.theme?.branding?.logoAlt || store.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg">
                              {store.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  store.isActive ? "default" : "secondary"
                                }
                              >
                                {store.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/store/${store.slug}`}
                                      target="_blank"
                                    >
                                      <Eye className="h-4 w-4 mr-2" /> Ver
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onEdit(store)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setStoreToDelete(store)}
                                  >
                                    <Trash className="h-4 w-4 mr-2" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {store.description || "Sin descripción"}
                          </p>

                          {/* Store Categories */}
                          {store.storeCategories && store.storeCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {store.storeCategories.slice(0, 3).map((assignment: any) => (
                                <Badge key={assignment.id} variant="outline" className="text-xs">
                                  <span className="mr-1">{assignment.storeCategory.icon}</span>
                                  {assignment.storeCategory.name}
                                </Badge>
                              ))}
                              {store.storeCategories.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{store.storeCategories.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button asChild className="mt-3">
                          <Link href={`/admin/stores/${store.slug}`}>
                            <Settings className="h-4 w-4 mr-2" /> Administrar
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {storeToDelete && (
                    <Dialog
                      open={!!storeToDelete}
                      onOpenChange={(open) => !open && setStoreToDelete(null)}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar eliminación</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que quieres eliminar la tienda
                            &quot;
                            {storeToDelete.name}&quot;? Esta acción no se puede
                            deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setStoreToDelete(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              onDelete(storeToDelete.id);
                              setStoreToDelete(null);
                            }}
                          >
                            Eliminar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                {items.length >= 5 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Has alcanzado el límite de 5 tiendas por usuario.
                  </div>
                )}
              </>
            )}
          />
        </main>
      </div>
    </div>
  );
}
