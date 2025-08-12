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

export interface ProductoCombo {
  id?: number
  categoriaId?: string
  cantidad: number
  filtro?: string
  nombre?: string
}

export interface ConfiguracionPromocion {
  categorias?: string[]
  productos?: ProductoCombo[]
  precioCombo?: number
  categoria?: string
  cantidadMinima?: number
  porcentaje?: number
  acumulable?: boolean
}

export interface Promocion {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
  fechaInicio: string
  fechaFin: string
  tipo: string
  configuracion?: ConfiguracionPromocion
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
