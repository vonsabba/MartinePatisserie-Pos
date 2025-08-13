"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAppContext } from "./app-context"

interface Usuario {
  id: number
  nombre: string
  rol: "administrador" | "empleado"
}

interface AuthContextType {
  usuario: Usuario | null
  login: (nombre: string, contraseña: string) => boolean
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const { usuarios } = useAppContext()

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem("pasteleria-auth")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUsuario(parsedUser)
      } catch (error) {
        console.error("Error loading saved user:", error)
        localStorage.removeItem("pasteleria-auth")
      }
    }
  }, [])

  const login = (nombre: string, contraseña: string): boolean => {
    const usuarioEncontrado = usuarios.find((u) => u.nombre === nombre && u.contraseña === contraseña)

    if (usuarioEncontrado) {
      const usuarioAuth: Usuario = {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        rol: usuarioEncontrado.rol as "administrador" | "empleado",
      }
      setUsuario(usuarioAuth)
      localStorage.setItem("pasteleria-auth", JSON.stringify(usuarioAuth))
      return true
    }
    return false
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem("pasteleria-auth")
  }

  const isAuthenticated = usuario !== null
  const isAdmin = usuario?.rol === "administrador"
  const isEmployee = usuario?.rol === "empleado"

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
