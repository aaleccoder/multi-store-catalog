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
import { Settings, Eye, Edit, Trash, MoreHorizontal } from "lucide-react";
import Header from "@/components/wholepage/Header";

interface StoreFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

function StoreForm({ formData, setFormData }: StoreFormProps) {
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);

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
          className="w-full border rounded p-2"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={!!formData.isActive}
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
                      <div className="aspect-square relative overflow-hidden rounded-md">
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
