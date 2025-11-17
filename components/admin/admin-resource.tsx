"use client"

import React, { useEffect, useState } from 'react'
import { trpc } from '@/trpc/client'
import { Plus, Search, Loader2, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
// AdminNav is intentionally not included here; pages will include it as necessary

type FieldType = 'text' | 'number' | 'textarea' | 'switch' | 'select'

export interface FormField {
    name: string
    label: string
    type?: FieldType
    required?: boolean
    options?: OptionType[]
}

type OptionType = {
    value?: string | number
    id?: string | number
    label?: string
    name?: string
}

type FormValue = string | number | boolean | readonly string[] | undefined

export interface Column<T = Record<string, unknown>> {
    header: string
    accessor?: keyof T | string
    render?: (item: T) => React.ReactNode
    className?: string
}

interface AdminResourceProps<T extends Record<string, unknown> = Record<string, unknown>> {
    title: string
    fetchUrl: string
    listTransform?: (data: unknown) => T[]
    columns: Column<T>[]
    formFields?: FormField[]
    createUrl?: string
    updateUrl?: (id: string) => string
    deleteUrl?: (id: string) => string
    keyField?: keyof T
    newButtonLabel?: string
    createPageUrl?: string
    searchKeys?: (keyof T | string)[]
    renderList?: (items: T[], loading: boolean, onEdit: (item: T) => void, onDelete: (id: string | number) => void) => React.ReactNode
    renderForm?: (options: { formData: Record<string, FormValue>; setFormData: React.Dispatch<React.SetStateAction<Record<string, FormValue>>> }) => React.ReactNode
    loadDependencies?: () => Promise<Record<string, unknown>>
    trpcResource?: string
    renderHeaderExtra?: () => React.ReactNode
}

export function AdminResource<T extends Record<string, unknown> = Record<string, unknown>>(props: AdminResourceProps<T>) {
    const {
        title,
        fetchUrl,
        listTransform,
        columns,
        formFields = [],
        createUrl,
        updateUrl,
        deleteUrl,
        keyField = 'id' as keyof T,
        newButtonLabel,
        createPageUrl,
        searchKeys = ['name'] as (keyof T | string)[],
        renderList,
        renderForm,
        loadDependencies,
        trpcResource,
        renderHeaderExtra,
    } = props

    const [items, setItems] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<T | null>(null)
    const [formData, setFormData] = useState<Record<string, FormValue>>({})
    const [dependencies, setDependencies] = useState<Record<string, unknown> | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<T | null>(null)
    const trpcAny = trpc as any

    function mapFetchUrlToTrpcPath(url?: string | null) {
        if (!url) return null
        let base = url.split('?')[0]
        if (base.endsWith('/')) base = base.slice(0, -1)
        switch (base) {
            case '/api/admin/categories':
                return 'admin.categories'
            case '/api/admin/subcategories':
                return 'admin.subcategories'
            case '/api/admin/currencies':
                return 'admin.currencies'
            case '/api/admin/products':
                return 'admin.products'
            case '/api/admin/media':
                return 'admin.media'
            case '/api/categories':
                return 'categories'
            case '/api/subcategories':
                return 'subcategories'
            case '/api/currencies':
                return 'currencies'
            case '/api/products':
                return 'products'
            default:
                return null
        }
    }

    const resolvedTrpcPath = trpcResource ?? mapFetchUrlToTrpcPath(fetchUrl)
    const adminTrpcPath = trpcResource ?? mapFetchUrlToTrpcPath(createUrl ?? updateUrl?.('') ?? deleteUrl?.(''))
    const useTrpc = !!resolvedTrpcPath

    let trpcList: any = null
    let trpcCreate: any = null
    let trpcUpdate: any = null
    let trpcDelete: any = null
    if (useTrpc) {
        const parts = resolvedTrpcPath!.split('.')
        if (parts.length === 1) {
            trpcList = trpcAny[parts[0]]?.list
            trpcCreate = trpcAny[parts[0]]?.create
            trpcUpdate = trpcAny[parts[0]]?.update
            trpcDelete = trpcAny[parts[0]]?.delete
        } else {
            trpcList = trpcAny[parts[0]]?.[parts[1]]?.list
            trpcCreate = trpcAny[parts[0]]?.[parts[1]]?.create
            trpcUpdate = trpcAny[parts[0]]?.[parts[1]]?.update
            trpcDelete = trpcAny[parts[0]]?.[parts[1]]?.delete
        }
    }

    if (adminTrpcPath) {
        const parts = adminTrpcPath.split('.')
        if (parts.length === 1) {
            trpcCreate = trpcCreate ?? trpcAny[parts[0]]?.create
            trpcUpdate = trpcUpdate ?? trpcAny[parts[0]]?.update
            trpcDelete = trpcDelete ?? trpcAny[parts[0]]?.delete
        } else {
            trpcCreate = trpcAny[parts[0]]?.[parts[1]]?.create ?? trpcCreate
            trpcUpdate = trpcAny[parts[0]]?.[parts[1]]?.update ?? trpcUpdate
            trpcDelete = trpcAny[parts[0]]?.[parts[1]]?.delete ?? trpcDelete
        }
    }

    const queryParams = fetchUrl.includes('?') ? Object.fromEntries(new URLSearchParams(fetchUrl.split('?')[1])) : undefined

    const listQueryHook = useTrpc && trpcList ? trpcList.useQuery(queryParams) : null



    const fetchListRemote = React.useCallback(async () => {
        setLoading(true)
        try {
            if (useTrpc && listQueryHook) {
                const data = listQueryHook.data
                if (!data) {
                    setItems([])
                    return
                }
                const list = listTransform ? listTransform(data) : (data as unknown as T[])
                setItems(list || [])
                return
            }

            const res = await fetch(fetchUrl)
            const json = await res.json()
            const list = listTransform ? listTransform(json) : (json as unknown as T[])
            setItems(list || [])
        } catch (err) {
            console.error('Failed to fetch resource', err)
        } finally {
            setLoading(false)
        }
    }, [fetchUrl, listTransform, useTrpc, listQueryHook])

    const fetchList = React.useCallback(async () => {
        if (useTrpc && listQueryHook) {
            try {
                setLoading(true)
                await listQueryHook.refetch()
            } catch (err) {
                console.error('tRPC list refetch failed', err)
            } finally {
                setLoading(false)
            }

            return
        }

        await fetchListRemote()
    }, [useTrpc, listQueryHook, fetchListRemote])

    // Mutations (create/update/delete) --- safe to define even if unused
    const createMutation = useTrpc && trpcCreate ? trpcCreate.useMutation({ onSuccess: () => fetchList() }) : null
    const updateMutation = useTrpc && trpcUpdate ? trpcUpdate.useMutation({ onSuccess: () => fetchList() }) : null
    const deleteMutation = useTrpc && trpcDelete ? trpcDelete.useMutation({ onSuccess: () => fetchList() }) : null

    useEffect(() => {
        // If the tRPC hook is handling the list, don't trigger a manual fetch
        if (useTrpc && listQueryHook) return
        fetchList()
    }, [useTrpc, listQueryHook, fetchList])

    // If using tRPC hooks directly, sync local items with the query result
    useEffect(() => {
        if (listQueryHook?.data) {
            const list = listTransform ? listTransform(listQueryHook.data) : (listQueryHook.data as unknown as T[])
            setItems(list || [])
            setLoading(listQueryHook.isLoading ?? false)
        }
    }, [listQueryHook?.data, listQueryHook?.isLoading, listTransform])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const editKeyVal = editing?.[keyField as keyof T]
        const url = editKeyVal
            ? updateUrl?.(String(editKeyVal)) ?? `${fetchUrl}/${String(editKeyVal)}`
            : createUrl ?? fetchUrl
        const method = editKeyVal ? 'PUT' : 'POST'

        try {
            if (useTrpc) {


                if (editKeyVal && updateMutation) {
                    await updateMutation.mutateAsync({ id: String(editKeyVal), data: formData })
                } else if (!editKeyVal && createMutation) {
                    await createMutation.mutateAsync(formData)
                } else {
                    // fallback to network
                    await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData),
                    })
                }
            } else {
                await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })
            }

            setDialogOpen(false)
            resetForm()
            fetchList()
            toast.success(editing ? 'Updated successfully' : 'Created successfully')
        } catch (err) {
            console.error('Failed to save', err)
            toast.error('Failed to save')
        }
    }

    function resetForm() {
        setEditing(null)
        setFormData({})
    }

    async function handleEdit(item: T) {
        setEditing(item)
        setFormData({ ...(item as unknown as Record<string, FormValue>) })
        if (loadDependencies) {
            const deps = await loadDependencies()
            setDependencies(deps)
        }
        setDialogOpen(true)
    }

    async function handleDelete(id: string | number) {
        const url = deleteUrl?.(String(id)) ?? `${fetchUrl}/${String(id)}`

        try {
            if (useTrpc && deleteMutation) {
                await deleteMutation.mutateAsync(String(id))
                fetchList()
                toast.success('Deleted successfully')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                return
            }

            await fetch(url, { method: 'DELETE' })
            fetchList()
            toast.success('Deleted successfully')
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        } catch (err) {
            console.error('Failed to delete', err)
            toast.error('Failed to delete')
        }
    }

    const filtered = items.filter((it) => {
        if (!search) return true
        const q = search.toLowerCase()
        return searchKeys.some((k) => {
            const val = String((it as Record<string, unknown>)[String(k)] ?? '').toLowerCase()
            return val.includes(q)
        })
    })

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-20 lg:pt-0">
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">{title}</h1>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            {createPageUrl ? (
                                <Link href={createPageUrl} onClick={() => { resetForm(); loadDependencies?.() }}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {newButtonLabel ?? `Add ${title.slice(0, -1)}`}
                                    </Button>
                                </Link>
                            ) : (
                                <DialogTrigger asChild>
                                    <Button onClick={() => { resetForm(); loadDependencies?.() }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {newButtonLabel ?? `Add ${title.slice(0, -1)}`}
                                    </Button>
                                </DialogTrigger>
                            )}
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editing ? `Edit ${title.slice(0, -1)}` : `Create ${title.slice(0, -1)}`}</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4 py-4">
                                        {renderForm
                                            ? renderForm({ formData, setFormData })
                                            : formFields.map((f) => (
                                                <div key={f.name} className="space-y-2">
                                                    <Label htmlFor={f.name}>{f.label}</Label>
                                                    {f.type === 'textarea' ? (
                                                        <textarea
                                                            id={f.name}
                                                            value={String(formData[f.name] ?? '')}
                                                            onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                                            className="w-full border rounded p-2"
                                                        />
                                                    ) : f.type === 'switch' ? (
                                                        <Switch
                                                            id={f.name}
                                                            checked={!!formData[f.name]}
                                                            onCheckedChange={(val: boolean) => setFormData({ ...formData, [f.name]: val })}
                                                        />
                                                    ) : f.type === 'select' ? (
                                                        <Select value={String(formData[f.name] ?? '')} onValueChange={(val) => setFormData({ ...formData, [f.name]: val })}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select…" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {(() => {
                                                                    const opts = (f.options ?? (dependencies?.[f.name] as OptionType[]) ?? []) as OptionType[]
                                                                    return opts.map((opt, idx) => (
                                                                        <SelectItem key={String(opt.value ?? opt.id ?? opt.name ?? idx)} value={String(opt.value ?? opt.id)}>
                                                                            {opt.label ?? opt.name}
                                                                        </SelectItem>
                                                                    ))
                                                                })()}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input
                                                            id={f.name}
                                                            value={String(formData[f.name] ?? '')}
                                                            onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                                            required={f.required}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete this {title.slice(0, -1)}?</p>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setItemToDelete(null) }}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => itemToDelete && handleDelete(String(itemToDelete[keyField as keyof T]))}>Delete</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={`Buscar ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
                            </div>
                            {renderHeaderExtra && renderHeaderExtra()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Usa la búsqueda para filtrar resultados.</p>
                    </div>

                    {renderList ? (
                        renderList(filtered, loading, handleEdit, handleDelete)
                    ) : (
                        <div className="bg-card rounded-lg border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns.map((c, i) => (
                                            <TableHead key={i} className={c.className}>{c.header}</TableHead>
                                        ))}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} className="text-center py-8">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading…
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} className="text-center py-8">No results</TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((item) => (
                                            <TableRow key={String(item[keyField as keyof T])}>
                                                {columns.map((c, i) => (
                                                    <TableCell key={i} className={c.className}>
                                                        {c.render ? c.render(item) : String((item as Record<string, unknown>)[String(c.accessor ?? '')] ?? '')}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true) }}>
                                                            <Trash className="h-4 w-4 hover:text-white" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default AdminResource