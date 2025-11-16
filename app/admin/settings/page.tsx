import { AdminNav } from '@/components/admin/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>
                                    Configure general application settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Settings configuration coming soon...</p>
                                <p className="text-xs text-muted-foreground mt-2">These settings apply to your whole store — changes will be reflected across the site.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>
                                    Manage your store details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Store settings coming soon...</p>
                                <p className="text-xs text-muted-foreground mt-2">Company name, contact, and timezone go here.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>MinIO Configuration</CardTitle>
                                <CardDescription>
                                    Current MinIO connection settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium">Endpoint:</span>{' '}
                                    <code className="bg-muted px-2 py-1 rounded">
                                        {process.env.MINIO_ENDPOINT || 'Not configured'}
                                    </code>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Bucket:</span>{' '}
                                    <code className="bg-muted px-2 py-1 rounded">
                                        {process.env.MINIO_BUCKET_NAME || 'Not configured'}
                                    </code>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Configure these settings in your environment variables
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
