"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${isScrolled ? "bg-primary" : "bg-transparent"} p-4 z-50`}
    >
      <div className="mx-auto max-w-5xl flex items-center gap-4">
        <Image
          src="/android-chrome-192x192.png"
          alt="Logo"
          width={64}
          height={64}
          className="rounded"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Una Ganga</h1>
          <p className="text-gray-600">Catálogos</p>
        </div>
      </div>
    </header>
  );
}
