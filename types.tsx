export interface Producto {
  id: number
  nombre: string
  precio: number
  imagen?: string
}

export interface ItemVenta {
  producto: Producto
  cantidad: number
}

export interface MedioPago {
  id: string
  nombre: string
  recargo: number
}

export interface Descuento {
  id: number
  nombre: string
  porcentaje: number
}

export interface Venta {
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
