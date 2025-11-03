import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/context/data-context"
import { ensureFirebaseInitialized } from "./firebase-init"
import { Toaster } from "@/components/ui/toaster"
import CustomCursor from "@/components/custom-cursor"

// Ensure Firebase is initialized
ensureFirebaseInitialized();

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIKU Cream - Portfolio Retro",
  description: "Portfolio retro aesthetic de KIKU Cream",
  generator: 'Rodrigo Rey'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} kiku-cursor`}>
        <DataProvider>
          <CustomCursor size={36} hotspot="center" />
          {children}
          <Toaster />
        </DataProvider>
      </body>
    </html>
  )
}
