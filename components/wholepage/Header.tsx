import Image from "next/image";

export default function Header() {
    return (
        <header className="bg-background border-b border-border p-4">
            <div className="mx-auto max-w-5xl flex items-center gap-4">
                <Image
                    src="/android-chrome-192x192.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="rounded"
                />
                <div>
                    <h1 className="text-2xl font-bold">Una Ganga</h1>
                    <p className="text-muted-foreground">Catalogos</p>
                </div>
            </div>
        </header>
    );
}
