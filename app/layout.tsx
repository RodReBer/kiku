import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/context/data-context"
import { ensureFirebaseInitialized } from "./firebase-init"
import { Toaster } from "@/components/ui/toaster"

// Ensure Firebase is initialized
ensureFirebaseInitialized();

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIKU Cream - Portfolio Retro",
  description: "Portfolio retro aesthetic de KIKU Cream",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <DataProvider>
          {children}
          <Toaster />
        </DataProvider>
      </body>
    </html>
  )
}
