import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                isActive: data.isActive,
                filters: data.filters,
            },
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.category.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
