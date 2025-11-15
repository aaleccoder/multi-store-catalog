'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminNav } from '@/components/admin/AdminNav'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface Media {
    id: string
    url: string
    alt: string
}

export default function MediaPage() {
    const [media, setMedia] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/admin/media?limit=100')
            const data = await res.json()
            setMedia(data.docs || [])
        } catch (error) {
            console.error('Error fetching media:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('alt', file.name)

                await fetch('/api/admin/media', {
                    method: 'POST',
                    body: formData,
                })
            }

            fetchMedia()
        } catch (error) {
            console.error('Error uploading files:', error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return

        try {
            await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
            fetchMedia()
        } catch (error) {
            console.error('Error deleting media:', error)
        }
    }

    const filteredMedia = media.filter((item) =>
        item.alt.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Media</h1>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload Images'}
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search media..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                    onClick={() => setSearch('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {search ? 'No media found' : 'No media uploaded yet'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredMedia.map((item) => (
                                <Card key={item.id} className="overflow-hidden group relative">
                                    <div className="aspect-square relative">
                                        <Image
                                            src={item.url}
                                            alt={item.alt}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground truncate">{item.alt}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
