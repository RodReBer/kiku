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
  title: "Kiku Cream Studio",
  description: "© All rights reserved.",
  authors: [{ name: 'Rodrigo Rey', url: 'https://rodrigorey.info' }],
  keywords: ['Kiku Cream Studio', 'Kiku Cream', 'Kiku', 'Cream', 'Drawing App', 'Painting App', 'Art App', 'Creative Studio', 'Digital Art', 'Art Software'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Kiku Cream Studio',
    description: '© All rights reserved.',
    url: 'https://kiku-cream.vercel.app',
    siteName: 'Kiku Cream Studio',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'Kiku Cream Studio',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiku Cream Studio',
    description: '© All rights reserved.',
    images: ['/favicon.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} kiku-cursor`} suppressHydrationWarning>
        <DataProvider>
          <CustomCursor size={36} hotspot="center" />
          {children}
          <Toaster />
        </DataProvider>
      </body>
    </html>
  )
}
