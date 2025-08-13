"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/login",
}: RouteGuardProps) {
  const { isAuthenticated, isAdmin, usuario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Si requiere admin y no es admin
    if (requireAdmin && !isAdmin) {
      router.push("/") // Redirigir al POS si no es admin
      return
    }
  }, [isAuthenticated, isAdmin, requireAuth, requireAdmin, router, redirectTo])

  // Mostrar loading mientras se verifica la autenticación
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si requiere admin y no es admin, no mostrar nada (se redirige)
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
