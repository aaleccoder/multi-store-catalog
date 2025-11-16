'use client'

import { api } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Role } from '@/generated/prisma'
import { toast } from 'sonner'

export default function UsersPage() {
    const { data: users, isLoading, error, refetch } = api.admin.users.list.useQuery()
    const updateUserRole = api.admin.users.updateRole.useMutation({
        onSuccess: () => {
            toast.success('User role updated')
            refetch()
        },
        onError: (err) => {
            toast.error('Failed to update user role', { description: err.message })
        }
    })
    const deleteUser = api.admin.users.delete.useMutation({
        onSuccess: () => {
            toast.success('User deleted')
            refetch()
        },
        onError: (err) => {
            toast.error('Failed to delete user', { description: err.message })
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell className="space-x-2">
                                {user.role === Role.EDITOR && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateUserRole.mutate({ id: user.id, role: Role.ADMIN })}
                                    >
                                        Make Admin
                                    </Button>
                                )}
                                {user.role === Role.ADMIN && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateUserRole.mutate({ id: user.id, role: Role.EDITOR })}
                                    >
                                        Make Editor
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this user?')) {
                                            deleteUser.mutate(user.id)
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
