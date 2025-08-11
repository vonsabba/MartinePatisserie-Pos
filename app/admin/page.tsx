interface Producto {
  id: number
  nombre: string
  precio: number
  imagen?: string
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

interface Promocion {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
  fechaInicio: string
  fechaFin: string
  tipo: string
  configuracion?: any // Configuración específica según el tipo
}

// Agregando interfaz Usuario
interface Usuario {
  id: string
  nombre: string
  username: string
  password: string
  rol: "administrador" | "empleado"
  activo: boolean
}

// Default export to fix the error
export default function AdminPage() {
  return <div>Admin Page</div>
}
