"use client"

import type React from "react"

import { useAppContext } from "@/contexts/app-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAppContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    } else if (isAuthenticated && pathname === "/login") {
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  // Si no está autenticado y no está en login, no mostrar nada mientras redirige
  if (!isAuthenticated && pathname !== "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
