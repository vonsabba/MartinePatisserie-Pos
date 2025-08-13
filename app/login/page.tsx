"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [nombre, setNombre] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    if (!nombre || !contraseña) {
      setError("Por favor, completa todos los campos")
      setCargando(false)
      return
    }

    const loginExitoso = login(nombre, contraseña)

    if (loginExitoso) {
      router.push("/")
    } else {
      setError("Usuario o contraseña incorrectos")
    }

    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/mp-logo.svg" alt="MP Logo" width={200} height={80} className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Gestión</h1>
          <p className="text-gray-600 mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Formulario de Login */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center text-gray-800">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Usuario</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  disabled={cargando}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contraseña"
                    type={mostrarContraseña ? "text" : "password"}
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    disabled={cargando}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                    disabled={cargando}
                  >
                    {mostrarContraseña ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                disabled={cargando}
              >
                {cargando ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </div>
                )}
              </Button>
            </form>

            {/* Credenciales de prueba */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Administrador:</strong> admin / admin123
                </div>
                <div>
                  <strong>Empleado:</strong> empleado / emp123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
