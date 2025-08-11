"use client"

import type React from "react"

import { useAppContext } from "@/contexts/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAppContext()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página.</p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">No tienes permisos de administrador para acceder a esta página.</p>
            <Link href="/">
              <Button>Volver al POS</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
