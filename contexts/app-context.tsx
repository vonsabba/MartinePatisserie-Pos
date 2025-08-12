"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Producto {
  id: number
  nombre: string
  precio: number
  imagen?: string
}

interface ProductoCombo {
  id?: number
  categoriaId?: string
  cantidad: number
  filtro?: string
  nombre?: string
}

interface ConfiguracionPromocion {
  categorias?: string[]
  productos?: ProductoCombo[]
  precioCombo?: number
  categoria?: string
  cantidadMinima?: number
  porcentaje?: number
  acumulable?: boolean
}

interface Promocion {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
  fechaInicio: string
  fechaFin: string
  tipo: string
  configuracion?: ConfiguracionPromocion
}

interface MedioPago {
  id: string
  nombre: string
  recargo: number
}

interface Descuento {
  id: number
  nombre: string
  porcentaje: number
}

interface Usuario {
  id: number
  nombre: string
  contraseña: string
  rol: "administrador" | "empleado"
}

interface ItemVenta {
  producto: Producto
  cantidad: number
}

interface Venta {
  id: string
  fecha: string
  items: ItemVenta[]
  subtotal: number
  descuentoManual: number
  descuentoPromociones: number
  promocionesAplicadas: string[]
  recargo: number
  total: number
  medioPago: string
  nombreMedioPago: string
}

interface AppContextType {
  productos: any
  setProductos: (productos: any) => void
  promociones: Promocion[]
  setPromociones: (promociones: Promocion[]) => void
  mediosPago: MedioPago[]
  setMediosPago: (medios: MedioPago[]) => void
  descuentos: Descuento[]
  setDescuentos: (descuentos: Descuento[]) => void
  usuarios: Usuario[]
  setUsuarios: (usuarios: Usuario[]) => void
  ventas: Venta[]
  agregarVenta: (venta: Omit<Venta, "id">) => void
  editarVenta: (id: string, ventaEditada: Omit<Venta, "id">) => void
  eliminarVenta: (id: string) => void
}

// Datos iniciales
const PRODUCTOS_INICIALES = {
  secos: {
    nombre: "Secos",
    orden: 1,
    productos: [
      { id: 1, nombre: "Cookie Pecán", precio: 180, imagen: "placeholder.svg" },
      { id: 2, nombre: "Cookie Avellanas", precio: 180, imagen: "cookie-avellanas.jpg" },
      { id: 3, nombre: "Cookie Pistacho", precio: 200, imagen: "cookie-pistacho.jpg" },
      { id: 4, nombre: "Cookie Shot", precio: 160, imagen: "cookie-shot.jpg" },
      { id: 5, nombre: "Scón de Queso", precio: 220, imagen: "scón-de-queso.jpg" },
      { id: 6, nombre: "Chipa", precio: 150, imagen: "chipa.jpg" },
      { id: 7, nombre: "Alfajor Manteca", precio: 280, imagen: "alfajor-manteca.jpg" },
      { id: 8, nombre: "Alfajor Maicena", precio: 280, imagen: "alfajor-maicena.jpg" },
      { id: 9, nombre: "Alfajor Almendra", precio: 320, imagen: "alfajor-almendra.jpg" },
      { id: 10, nombre: "Alfajor Pistacho", precio: 350, imagen: "alfajor-pistacho.jpg" },
      { id: 11, nombre: "Alfajor Berrylate", precio: 300, imagen: "alfajor-berrylate.jpg" },
      { id: 12, nombre: "Financier Pistacho", precio: 380, imagen: "financier-pistacho.jpg" },
      { id: 13, nombre: "Financier Frutos Rojos", precio: 360, imagen: "financier-frutos-rojos.jpg" },
    ],
  },
  minicakes: {
    nombre: "Minicakes",
    orden: 2,
    productos: [
      { id: 14, nombre: "Lemon", precio: 450, imagen: "lemon.jpg" },
      { id: 15, nombre: "Carrot Cake", precio: 480, imagen: "carrot-cake.jpg" },
      { id: 16, nombre: "Cheesecake Pistacho", precio: 520, imagen: "cheesecake-pistacho.jpg" },
      { id: 17, nombre: "Cheesecake Chocolate", precio: 500, imagen: "cheesecake-chocolate.jpg" },
      { id: 18, nombre: "Cheesecake Frambuesa", precio: 510, imagen: "cheesecake-frambuesa.jpg" },
      { id: 19, nombre: "Brownie", precio: 420, imagen: "brownie.jpg" },
      { id: 20, nombre: "Lingote Marroc", precio: 480, imagen: "lingote-marroc.jpg" },
      { id: 21, nombre: "Lingote Maracuyá", precio: 480, imagen: "lingote-maracuя.jpg" },
      { id: 22, nombre: "Profiterol Avellana", precio: 460, imagen: "profiterol-avellana.jpg" },
      { id: 23, nombre: "Profiterol Diplomata", precio: 460, imagen: "profiterol-diplomata.jpg" },
      { id: 24, nombre: "Tiramisu", precio: 490, imagen: "tiramisu.jpg" },
      { id: 25, nombre: "Rosa", precio: 520, imagen: "rosa.jpg" },
      { id: 26, nombre: "Rocher", precio: 500, imagen: "rocher.jpg" },
      { id: 27, nombre: "Paris Brest", precio: 540, imagen: "paris-brest.jpg" },
      { id: 28, nombre: "Duo", precio: 480, imagen: "duo.jpg" },
      { id: 29, nombre: "Pistacho", precio: 550, imagen: "pistacho.jpg" },
      { id: 30, nombre: "Avellanas", precio: 480, imagen: "avellanas.jpg" },
      { id: 31, nombre: "Pavlova", precio: 460, imagen: "pavlova.jpg" },
      { id: 32, nombre: "Ricotta", precio: 440, imagen: "ricotta.jpg" },
      { id: 33, nombre: "Concorde", precio: 520, imagen: "concorde.jpg" },
      { id: 34, nombre: "Oreo", precio: 450, imagen: "oreo.jpg" },
    ],
  },
  tortas: {
    nombre: "Tortas",
    orden: 3,
    productos: [
      { id: 35, nombre: "Lemon Pie Grande", precio: 3200, imagen: "lemon-pie-grande.jpg" },
      { id: 36, nombre: "Lemon Pie Chico", precio: 2400, imagen: "lemon-pie-chico.jpg" },
      { id: 37, nombre: "Balcarce Grande", precio: 3500, imagen: "balcarce-grande.jpg" },
      { id: 38, nombre: "Balcarce Chico", precio: 2600, imagen: "balcarce-chico.jpg" },
      { id: 39, nombre: "Frutilla Grande", precio: 3300, imagen: "frutilla-grande.jpg" },
      { id: 40, nombre: "Frutilla Chico", precio: 2500, imagen: "frutilla-chico.jpg" },
      { id: 41, nombre: "Brownie Grande", precio: 3100, imagen: "brownie-grande.jpg" },
      { id: 42, nombre: "Brownie Chico", precio: 2300, imagen: "brownie-chico.jpg" },
      { id: 43, nombre: "Tiramisú Grande", precio: 3600, imagen: "tiramisú-grande.jpg" },
      { id: 44, nombre: "Tiramisú Chico", precio: 2700, imagen: "tiramisú-chico.jpg" },
      { id: 45, nombre: "Sambayón Grande", precio: 3400, imagen: "sambayón-grande.jpg" },
      { id: 46, nombre: "Sambayón Chico", precio: 2550, imagen: "sambayón-chico.jpg" },
      { id: 47, nombre: "NY Cheesecake Grande", precio: 3800, imagen: "ny-cheesecake-grande.jpg" },
      { id: 48, nombre: "NY Cheesecake Chico", precio: 2850, imagen: "ny-cheesecake-chico.jpg" },
      { id: 49, nombre: "Dúo Grande", precio: 3300, imagen: "dúo-grande.jpg" },
      { id: 50, nombre: "Dúo Chico", precio: 2500, imagen: "dúo-chico.jpg" },
      { id: 51, nombre: "Ricotta Grande", precio: 3000, imagen: "ricotta-grande.jpg" },
      { id: 52, nombre: "Ricotta Chico", precio: 2250, imagen: "ricotta-chico.jpg" },
    ],
  },
  bebidas: {
    nombre: "Bebidas",
    orden: 4,
    productos: [
      { id: 53, nombre: "Café", precio: 180, imagen: "café.jpg" },
      { id: 54, nombre: "Café con Leche", precio: 220, imagen: "café-con-leche.jpg" },
      { id: 55, nombre: "Jugo", precio: 250, imagen: "jugo.jpg" },
      { id: 56, nombre: "Chocolatada", precio: 280, imagen: "chocolatada.jpg" },
    ],
  },
}

const PROMOCIONES_INICIALES: Promocion[] = [
  {
    id: 1,
    nombre: "2x1 en Cookies",
    descripcion: "Llevá 2 cookies y pagá 1 (se cobra la más cara)",
    activa: true,
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    tipo: "2x1",
    configuracion: {
      productos: [
        { categoriaId: "secos", cantidad: 1 }, // Cualquier producto de secos
      ],
    },
  },
  {
    id: 2,
    nombre: "Combo Café + Cookie",
    descripcion: "Café con leche + cualquier cookie por precio especial",
    activa: true,
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    tipo: "combo",
    configuracion: {
      productos: [
        { id: 54, cantidad: 1 }, // Café con Leche específico
        { categoriaId: "secos", cantidad: 1 }, // Cualquier cookie
      ],
      precioCombo: 350,
    },
  },
  {
    id: 3,
    nombre: "3+ Minicakes 10% OFF",
    descripcion: "10% OFF comprando 3 o más minicakes",
    activa: true,
    fechaInicio: "2024-01-15",
    fechaFin: "2024-12-15",
    tipo: "descuento-cantidad",
    configuracion: {
      productos: [{ categoriaId: "minicakes", cantidad: 1 }],
      cantidadMinima: 3,
      porcentaje: 10,
    },
  },
]

const MEDIOS_PAGO_INICIALES: MedioPago[] = [
  { id: "efectivo", nombre: "Efectivo", recargo: 0 },
  { id: "tarjeta", nombre: "Tarjeta", recargo: 24 },
  { id: "transferencia", nombre: "Transferencia", recargo: 24 },
]

const DESCUENTOS_INICIALES: Descuento[] = [
  { id: 10, nombre: "10% OFF", porcentaje: 10 },
  { id: 20, nombre: "20% OFF", porcentaje: 20 },
]

const USUARIOS_INICIALES: Usuario[] = [
  { id: 1, nombre: "admin", contraseña: "admin123", rol: "administrador" },
  { id: 2, nombre: "empleado", contraseña: "emp123", rol: "empleado" },
]

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES)
  const [promociones, setPromociones] = useState<Promocion[]>(PROMOCIONES_INICIALES)
  const [mediosPago, setMediosPago] = useState<MedioPago[]>(MEDIOS_PAGO_INICIALES)
  const [descuentos, setDescuentos] = useState<Descuento[]>(DESCUENTOS_INICIALES)
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES)
  const [ventas, setVentas] = useState<Venta[]>([])

  // Persistir en localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("pasteleria-data")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.productos) setProductos(parsed.productos)
        if (parsed.promociones) setPromociones(parsed.promociones)
        if (parsed.mediosPago) setMediosPago(parsed.mediosPago)
        if (parsed.descuentos) setDescuentos(parsed.descuentos)
        if (parsed.usuarios) setUsuarios(parsed.usuarios)
        if (parsed.ventas) setVentas(parsed.ventas)
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const dataToSave = {
      productos,
      promociones,
      mediosPago,
      descuentos,
      usuarios,
      ventas,
    }
    localStorage.setItem("pasteleria-data", JSON.stringify(dataToSave))
  }, [productos, promociones, mediosPago, descuentos, usuarios, ventas])

  const agregarVenta = (nuevaVenta: Omit<Venta, "id">) => {
    const venta: Venta = {
      ...nuevaVenta,
      id: `venta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setVentas((prev) => [venta, ...prev]) // Agregar al principio para mostrar las más recientes primero
  }

  const editarVenta = (id: string, ventaEditada: Omit<Venta, "id">) => {
    setVentas((prev) => prev.map((venta) => (venta.id === id ? { ...ventaEditada, id } : venta)))
  }

  const eliminarVenta = (id: string) => {
    setVentas((prev) => prev.filter((venta) => venta.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        productos,
        setProductos,
        promociones,
        setPromociones,
        mediosPago,
        setMediosPago,
        descuentos,
        setDescuentos,
        usuarios,
        setUsuarios,
        ventas,
        agregarVenta,
        editarVenta,
        eliminarVenta,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
