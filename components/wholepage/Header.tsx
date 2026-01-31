"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogoutDialog } from "@/components/ui/logout-dialog";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    setIsDialogOpen(false);
    router.push("/login-admin");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 ${isScrolled ? "bg-primary" : "bg-primary/70"} p-4 z-50`}
      >
        <div className="mx-auto max-w-9xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="link"
              className="h-fit w-fit p-0 hover:scale-110 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo"
                width={64}
                height={64}
                className="rounded"
              />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-700">Una Ganga</h1>
              <p className="text-gray-600">Catálogos</p>
            </div>
          </div>
          {session && (
            <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>
      <LogoutDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
