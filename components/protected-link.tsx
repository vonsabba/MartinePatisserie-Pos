"use client"

import type React from "react"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedLinkProps {
  href: string
  children: React.ReactNode
  requireAdmin?: boolean
  className?: string
}

export function ProtectedLink({ href, children, requireAdmin = false, className }: ProtectedLinkProps) {
  const { isAdmin } = useAuth()

  // Si requiere admin y no es admin, no mostrar el link
  if (requireAdmin && !isAdmin) {
    return null
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
