"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  DollarSign,
  Percent,
  X,
  Gift,
  Zap,
  Layers,
  BarChart3,
  Activity,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePromociones } from "@/hooks/use-promociones"
import { useAppContext } from "@/contexts/app-context"

const MEDIOS_PAGO = [
  { id: "efectivo", nombre: "Efectivo" },
  { id: "tarjeta", nombre: "Tarjeta" },
  { id: "transferencia", nombre: "Transferencia" },
]

const CONFIGURACION_RECARGOS = {
  efectivo: { recargo: 0, nombre: "Efectivo" },
  tarjeta: { recargo: 1.24, nombre: "Tarjeta" },
  transferencia: { recargo: 1.24, nombre: "Transferencia" },
}

const DESCUENTOS_DISPONIBLES = [
  { id: 10, nombre: "10% OFF", porcentaje: 0.1 },
  { id: 20, nombre: "20% OFF", porcentaje: 0.2 },
]

interface Producto {
  id: number
  nombre: string
  precio: number
}

interface ItemVenta {
  producto: Producto
  cantidad: number
}

export default function POS() {
  const { productos: PRODUCTOS_POR_CATEGORIA, promociones, mediosPago, agregarVenta } = useAppContext()
  const [categoriaActual, setCategoriaActual] = useState<string | null>(null)
  const [carrito, setCarrito] = useState<ItemVenta[]>([])
  const [medioPago, setMedioPago] = useState("")
  const [descuentoAplicado, setDescuentoAplicado] = useState<number>(0)
  const [ventaConcretada, setVentaConcretada] = useState(false)
  const [modalManual, setModalManual] = useState(false)
  const [productoManual, setProductoManual] = useState({ nombre: "", precio: "" })
  const [fechaHora, setFechaHora] = useState(new Date())
  const [ultimaVenta, setUltimaVenta] = useState<{
    total: number
    subtotal: number
    descuentoTotal: number
    recargo: number
    promociones: string[]
  } | null>(null)

  // Hook para detectar promociones
  const { promocionesDetectadas, promocionesAplicables, mejorPromocion, descuentoTotal } = usePromociones(
    carrito,
    promociones,
    PRODUCTOS_POR_CATEGORIA,
  )

  // Actualizar fecha y hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHora(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const volverACategorias = () => {
    setCategoriaActual(null)
  }

  const agregarProducto = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id)
      if (existente) {
        return prev.map((item) => (item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  const agregarProductoManual = () => {
    if (!productoManual.nombre || !productoManual.precio) return

    const producto: Producto = {
      id: Date.now(),
      nombre: productoManual.nombre,
      precio: Number.parseFloat(productoManual.precio),
    }

    agregarProducto(producto)
    setProductoManual({ nombre: "", precio: "" })
    setModalManual(false)
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId))
    } else {
      setCarrito((prev) =>
        prev.map((item) => (item.producto.id === productoId ? { ...item, cantidad: nuevaCantidad } : item)),
      )
    }
  }

  const eliminarProducto = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId))
  }

  const aplicarDescuento = (porcentaje: number) => {
    setDescuentoAplicado(porcentaje)
  }

  const quitarDescuento = () => {
    setDescuentoAplicado(0)
  }

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }

  const calcularDescuentoManual = () => {
    return calcularSubtotal() * descuentoAplicado
  }

  const calcularDescuentoTotal = () => {
    // Sumar descuento manual + descuento de promociones
    return calcularDescuentoManual() + descuentoTotal
  }

  const calcularSubtotalConDescuento = () => {
    return calcularSubtotal() - calcularDescuentoTotal()
  }

  const calcularTotal = () => {
    const subtotalConDescuento = calcularSubtotalConDescuento()

    if (!medioPago || medioPago === "efectivo") {
      return subtotalConDescuento
    }

    // Aplicar recargo y redondear hacia arriba en centenas
    const totalConRecargo =
      subtotalConDescuento * CONFIGURACION_RECARGOS[medioPago as keyof typeof CONFIGURACION_RECARGOS].recargo
    return Math.ceil(totalConRecargo / 100) * 100
  }

  const obtenerRecargo = () => {
    if (!medioPago || medioPago === "efectivo") return 0
    const subtotalConDescuento = calcularSubtotalConDescuento()
    return calcularTotal() - subtotalConDescuento
  }

  const obtenerNombreMedioPago = (id: string) => {
    const medio = mediosPago.find((m) => m.id === id)
    return medio ? medio.nombre : id
  }

  const procesarVenta = () => {
    if (carrito.length === 0 || !medioPago) return

    // CALCULAR TODOS LOS VALORES ANTES DE LIMPIAR EL ESTADO
    const subtotal = calcularSubtotal()
    const descuentoManual = calcularDescuentoManual()
    const recargo = obtenerRecargo()
    const total = calcularTotal()
    const descuentoTotalCalculado = calcularDescuentoTotal()

    const venta = {
      fecha: new Date().toISOString(),
      items: carrito,
      subtotal,
      descuentoManual,
      descuentoPromociones: descuentoTotal,
      promocionesAplicadas: promocionesAplicables.map((p) => p.promocion.nombre),
      recargo,
      total,
      medioPago,
      nombreMedioPago: obtenerNombreMedioPago(medioPago),
    }

    console.log("Venta procesada:", venta)

    // Registrar la venta en el contexto
    agregarVenta(venta)

    // GUARDAR LOS DATOS PARA EL MENSAJE
    setUltimaVenta({
      total,
      subtotal,
      descuentoTotal: descuentoTotalCalculado,
      recargo,
      promociones: promocionesAplicables.map((p) => p.promocion.nombre),
    })

    setCarrito([])
    setMedioPago("")
    setDescuentoAplicado(0)
    setVentaConcretada(true)
    setCategoriaActual(null)

    setTimeout(() => {
      setVentaConcretada(false)
      setUltimaVenta(null)
    }, 3000)
  }

  const nuevaVenta = () => {
    setCarrito([])
    setMedioPago("")
    setDescuentoAplicado(0)
    setVentaConcretada(false)
    setCategoriaActual(null)
  }

  const formatearFechaHora = (fecha: Date) => {
    return fecha.toLocaleString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 px-10 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header con logo y fecha */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image src="/mp-logo.svg" alt="MP Logo" width={200} height={80} className="h-16 w-auto" />
          </div>
          <p className="text-sm text-gray-600 capitalize">{formatearFechaHora(fechaHora)}</p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Panel de Administración
              </Button>
            </Link>
            <Link href="/ventas">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Ventas
              </Button>
            </Link>
            <Link href="/estadisticas">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Estadísticas
              </Button>
            </Link>
          </div>
        </div>

        {ventaConcretada && ultimaVenta && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            ✅ ¡Venta procesada exitosamente!
            <br />
            <span className="font-bold">Total: ${ultimaVenta.total.toLocaleString()}</span>
            {(ultimaVenta.descuentoTotal > 0 || ultimaVenta.recargo > 0) && (
              <span className="text-sm block mt-1">
                (Subtotal: ${ultimaVenta.subtotal.toLocaleString()}
                {ultimaVenta.descuentoTotal > 0 && ` - Descuento: $${ultimaVenta.descuentoTotal.toLocaleString()}`}
                {ultimaVenta.recargo > 0 && ` + Recargo: $${ultimaVenta.recargo.toLocaleString()}`})
              </span>
            )}
            {ultimaVenta.promociones.length > 0 && (
              <div className="mt-2 text-sm flex flex-wrap justify-center gap-1">
                {ultimaVenta.promociones.map((promo, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-200 text-green-800">
                    <Gift className="h-3 w-3 mr-1" />
                    {promo}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Productos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {categoriaActual
                  ? PRODUCTOS_POR_CATEGORIA[categoriaActual as keyof typeof PRODUCTOS_POR_CATEGORIA].nombre
                  : "Categorías"}
              </CardTitle>
              <div className="flex gap-2">
                {categoriaActual && (
                  <Button variant="outline" size="sm" onClick={volverACategorias}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                )}
                <Dialog open={modalManual} onOpenChange={setModalManual}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Producto Manual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nombre-manual">Nombre del producto</Label>
                        <Input
                          id="nombre-manual"
                          value={productoManual.nombre}
                          onChange={(e) => setProductoManual((prev) => ({ ...prev, nombre: e.target.value }))}
                          placeholder="Ej: Producto especial"
                        />
                      </div>
                      <div>
                        <Label htmlFor="precio-manual">Precio</Label>
                        <Input
                          id="precio-manual"
                          type="number"
                          value={productoManual.precio}
                          onChange={(e) => setProductoManual((prev) => ({ ...prev, precio: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <Button onClick={agregarProductoManual} className="w-full">
                        Agregar al Carrito
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!categoriaActual ? (
                // Vista de categorías
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(PRODUCTOS_POR_CATEGORIA).map(([key, categoria]) => (
                    <div
                      key={key}
                      className="p-6 border-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all text-center"
                      onClick={() => setCategoriaActual(key)}
                    >
                      <h3 className="text-xl font-semibold text-blue-700">{categoria.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-2">{categoria.productos.length} productos</p>
                    </div>
                  ))}
                </div>
              ) : (
                // Vista de productos de la categoría seleccionada
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {PRODUCTOS_POR_CATEGORIA[categoriaActual as keyof typeof PRODUCTOS_POR_CATEGORIA].productos.map(
                    (producto) => (
                      <div
                        key={producto.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => agregarProducto(producto)}
                      >
                        <h3 className="font-medium text-sm">{producto.nombre}</h3>
                        <p className="text-lg font-bold text-green-600">${producto.precio.toLocaleString()}</p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Venta */}
          <Card>
            <CardHeader>
              <CardTitle className="">Venta Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items del carrito */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {carrito.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Selecciona productos para comenzar la venta</p>
                ) : (
                  carrito.map((item) => (
                    <div key={item.producto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.producto.nombre}</h4>
                        <p className="text-xs text-gray-600">${item.producto.precio.toLocaleString()} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-medium text-sm">{item.cantidad}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => eliminarProducto(item.producto.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="ml-2 font-bold text-sm">
                        ${(item.producto.precio * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Promociones detectadas */}
              {promocionesDetectadas.length > 0 && carrito.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm font-medium">Promociones disponibles:</Label>
                  </div>
                  <div className="space-y-2">
                    {promocionesDetectadas.map((promo) => (
                      <div
                        key={promo.promocion.id}
                        className={`p-3 rounded-lg border ${
                          promo.aplicable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-medium text-sm ${promo.aplicable ? "text-green-800" : "text-gray-600"}`}
                              >
                                {promo.promocion.nombre}
                              </h4>
                              {promo.promocion.configuracion?.acumulable && (
                                <Badge variant="outline" className="text-xs">
                                  <Layers className="h-3 w-3 mr-1" />
                                  Acumulable
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{promo.descripcionAplicacion}</p>
                          </div>
                          <div className="text-right">
                            {promo.aplicable && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Gift className="h-3 w-3 mr-1" />
                                -${promo.descuento.toLocaleString()}
                              </Badge>
                            )}
                            {!promo.aplicable && (
                              <Badge variant="secondary" className="text-xs">
                                No aplica
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {promocionesAplicables.length > 0 && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-center">
                      <p className="text-xs text-orange-700">
                        <Zap className="h-3 w-3 inline mr-1" />
                        Se aplicarán automáticamente:{" "}
                        {promocionesAplicables.length > 1 ? (
                          <span className="font-medium">{promocionesAplicables.length} promociones acumulables</span>
                        ) : (
                          <strong>{promocionesAplicables[0].promocion.nombre}</strong>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Descuentos manuales */}
              {carrito.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Descuentos manuales:</Label>
                    {descuentoAplicado > 0 && (
                      <Button size="sm" variant="ghost" onClick={quitarDescuento}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {DESCUENTOS_DISPONIBLES.map((descuento) => (
                      <Button
                        key={descuento.id}
                        size="sm"
                        variant={descuentoAplicado === descuento.porcentaje ? "default" : "outline"}
                        onClick={() => aplicarDescuento(descuento.porcentaje)}
                        disabled={descuentoAplicado === descuento.porcentaje}
                      >
                        <Percent className="h-3 w-3 mr-1" />
                        {descuento.nombre}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {carrito.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Subtotal:</span>
                    <span className="text-lg">${calcularSubtotal().toLocaleString()}</span>
                  </div>

                  {calcularDescuentoManual() > 0 && (
                    <div className="flex justify-between items-center text-blue-600">
                      <span className="text-sm">Descuento manual ({(descuentoAplicado * 100).toFixed(0)}%):</span>
                      <span className="text-sm">-${calcularDescuentoManual().toLocaleString()}</span>
                    </div>
                  )}

                  {descuentoTotal > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">
                        Promociones (
                        {promocionesAplicables.length > 1
                          ? `${promocionesAplicables.length} aplicadas`
                          : promocionesAplicables[0]?.promocion.nombre}
                        ):
                      </span>
                      <span className="text-sm">-${descuentoTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {obtenerRecargo() > 0 && (
                    <div className="flex justify-between items-center text-orange-600">
                      <span className="text-sm">
                        Recargo ({CONFIGURACION_RECARGOS[medioPago as keyof typeof CONFIGURACION_RECARGOS].nombre}):
                      </span>
                      <span className="text-sm">+${obtenerRecargo().toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${calcularTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Medio de pago */}
              {carrito.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="medio-pago">Medio de Pago</Label>
                  <Select value={medioPago} onValueChange={setMedioPago}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar medio de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIOS_PAGO.map((medio) => (
                        <SelectItem key={medio.id} value={medio.id}>
                          {medio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button onClick={procesarVenta} disabled={carrito.length === 0 || !medioPago} className="flex-1">
                  Procesar Venta
                </Button>
                <Button onClick={nuevaVenta} variant="outline" disabled={carrito.length === 0}>
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
