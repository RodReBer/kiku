"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/examples/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Overview
      </Link>
      <Link
        href="/examples/dashboard/customers"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard/customers" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Customers
      </Link>
      <Link
        href="/examples/dashboard/products"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard/products" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Products
      </Link>
      <Link
        href="/examples/dashboard/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Settings
      </Link>
    </nav>
  )
}
