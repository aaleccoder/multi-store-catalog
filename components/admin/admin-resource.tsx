"use client"

import React, { useEffect, useState } from 'react'
import { Plus, Search, Loader2, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AdminNav } from '@/components/admin/admin-nav'

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
    searchKeys?: (keyof T | string)[]
    renderList?: (items: T[], loading: boolean, onEdit: (item: T) => void, onDelete: (id: string | number) => void) => React.ReactNode
    renderForm?: (options: { formData: Record<string, FormValue>; setFormData: React.Dispatch<React.SetStateAction<Record<string, FormValue>>> }) => React.ReactNode
    loadDependencies?: () => Promise<Record<string, unknown>>
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
        searchKeys = ['name'] as (keyof T | string)[],
        renderList,
        renderForm,
        loadDependencies,
    } = props

    const [items, setItems] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<T | null>(null)
    const [formData, setFormData] = useState<Record<string, FormValue>>({})
    const [dependencies, setDependencies] = useState<Record<string, unknown> | null>(null)

    const fetchList = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(fetchUrl)
            const json = await res.json()
            const list = listTransform ? listTransform(json) : (json as unknown as T[])
            setItems(list || [])
        } catch (err) {
            console.error('Failed to fetch resource', err)
        } finally {
            setLoading(false)
        }
    }, [fetchUrl, listTransform])

    useEffect(() => {
        fetchList()
    }, [fetchList])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const editKeyVal = editing?.[keyField as keyof T]
        const url = editKeyVal
            ? updateUrl?.(String(editKeyVal)) ?? `${fetchUrl}/${String(editKeyVal)}`
            : createUrl ?? fetchUrl
        const method = editKeyVal ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            setDialogOpen(false)
            resetForm()
            fetchList()
        } catch (err) {
            console.error('Failed to save', err)
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
        if (!confirm(`Are you sure you want to delete this ${title}?`)) return

        const url = deleteUrl?.(String(id)) ?? `${fetchUrl}/${String(id)}`

        try {
            await fetch(url, { method: 'DELETE' })
            fetchList()
        } catch (err) {
            console.error('Failed to delete', err)
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
                            <DialogTrigger asChild>
                                <Button onClick={() => { resetForm(); loadDependencies?.() }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {newButtonLabel ?? `Add ${title.slice(0, -1)}`}
                                </Button>
                            </DialogTrigger>
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
                                                        <select
                                                            id={f.name}
                                                            value={String(formData[f.name] ?? '')}
                                                            onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                                            className="w-full border p-2 rounded"
                                                        >
                                                            <option value="">Select…</option>
                                                            {(() => {
                                                                const opts = (f.options ?? (dependencies?.[f.name] as OptionType[]) ?? []) as OptionType[]
                                                                return opts.map((opt, idx) => (
                                                                    <option key={String(opt.value ?? opt.id ?? opt.name ?? idx)} value={opt.value ?? opt.id}>
                                                                        {opt.label ?? opt.name}
                                                                    </option>
                                                                ))
                                                            })()}
                                                        </select>
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
                    </div>

                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
                            <p className="text-xs text-muted-foreground mt-2">Use search to filter results.</p>
                        </div>
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
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(String(item[keyField as keyof T]))}>
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