"use client"

import { useState, useEffect, useMemo } from "react"
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
  Package,
  LogOut,
  User,
} from "lucide-react"
import Image from "next/image"
import { usePromociones } from "@/hooks/use-promociones"
import { useAppContext } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedLink } from "@/components/protected-link"
import { RouteGuard } from "@/components/route-guard"
import type { ItemVenta, Producto } from "@/types" // Import or declare the variables here

export default function POS() {
  const { productos: PRODUCTOS_POR_CATEGORIA, promociones, mediosPago, agregarVenta, descuentos } = useAppContext()
  const { usuario, logout, isAdmin } = useAuth()

  const [categoriaActual, setCategoriaActual] = useState<string | null>(null)
  const [carrito, setCarrito] = useState<ItemVenta[]>([])
  const [medioPago, setMedioPago] = useState("")
  const [descuentoAplicado, setDescuentoAplicado] = useState<number>(0)
  const [ventaConcretada, setVentaConcretada] = useState(false)
  const [modalManual, setModalManual] = useState(false)
  const [productoManual, setProductoManual] = useState({ nombre: "", precio: "" })
  const [busquedaProducto, setBusquedaProducto] = useState("")
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

  const handleLogout = () => {
    logout()
  }

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
    setDescuentoAplicado(porcentaje / 100)
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

    if (!medioPago) {
      return subtotalConDescuento
    }

    const medioSeleccionado = mediosPago.find((m) => m.id === medioPago)
    if (!medioSeleccionado || medioSeleccionado.recargo === 0) {
      return subtotalConDescuento
    }

    const porcentajeRecargo = medioSeleccionado.recargo / 100
    const totalConRecargo = subtotalConDescuento * (1 + porcentajeRecargo)

    if (porcentajeRecargo > 0) {
      return Math.ceil(totalConRecargo / 100) * 100
    }

    return Math.round(totalConRecargo)
  }

  const obtenerRecargo = () => {
    if (!medioPago) return 0

    const medioSeleccionado = mediosPago.find((m) => m.id === medioPago)
    if (!medioSeleccionado || medioSeleccionado.recargo === 0) return 0

    const subtotalConDescuento = calcularSubtotalConDescuento()
    return calcularTotal() - subtotalConDescuento
  }

  const obtenerNombreMedioPago = (id: string) => {
    const medio = mediosPago.find((m) => m.id === id)
    return medio ? medio.nombre : id
  }

  const procesarVenta = () => {
    if (carrito.length === 0 || !medioPago || !usuario) return

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
      usuario: usuario.nombre,
    }

    console.log("Venta procesada:", venta)

    agregarVenta(venta)

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
    setBusquedaProducto("") // Limpiar búsqueda al iniciar nueva venta
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

  const productosEncontrados = useMemo(() => {
    if (!busquedaProducto.trim()) return []

    const productos: Producto[] = []
    Object.values(PRODUCTOS_POR_CATEGORIA).forEach((categoria) => {
      categoria.productos.forEach((producto) => {
        if (producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())) {
          productos.push(producto)
        }
      })
    })
    return productos.slice(0, 8) // Limitar a 8 resultados
  }, [busquedaProducto, PRODUCTOS_POR_CATEGORIA])

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-4 lg:px-10 lg:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header con logo, fecha y navegación */}
          <div className="flex flex-col items-center mb-4 sm:mb-8">
            <div className="mb-2 sm:mb-4">
              <Image src="/mp-logo.svg" alt="MP Logo" width={200} height={80} className="h-8 sm:h-16 w-auto" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 capitalize text-center px-2">
              {formatearFechaHora(fechaHora)}
            </p>

            <div className="mt-3 sm:mt-4 w-full flex flex-col md:flex-row justify-center items-center">
              {/* Botones de navegación - scroll horizontal en móvil */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0  items-center justify-center mb-3 md:mb-0 md:mr-4">
                <ProtectedLink href="/admin" requireAdmin={true}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap text-xs sm:text-sm bg-transparent">
                    <span className="hidden sm:inline">Panel de Administración</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                </ProtectedLink>
                <ProtectedLink href="/ventas" requireAdmin={true}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap text-xs sm:text-sm bg-transparent">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ver Ventas</span>
                    <span className="sm:hidden">Ventas</span>
                  </Button>
                </ProtectedLink>
                <ProtectedLink href="/estadisticas" requireAdmin={true}>
                  <Button variant="outline" size="sm" className="whitespace-nowrap text-xs sm:text-sm bg-transparent">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Estadísticas</span>
                    <span className="sm:hidden">Stats</span>
                  </Button>
                </ProtectedLink>
              </div>

              {/* Usuario y logout - centrado en móvil */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">{usuario?.nombre}</span>
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {usuario?.rol}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </Button>
              </div>
            </div>
          </div>

          {ventaConcretada && ultimaVenta && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center text-sm sm:text-base">
              ✅ ¡Venta procesada exitosamente!
              <br />
              <span className="font-bold">Total: ${ultimaVenta.total.toLocaleString()}</span>
              {(ultimaVenta.descuentoTotal > 0 || ultimaVenta.recargo > 0) && (
                <span className="text-xs sm:text-sm block mt-1">
                  (Subtotal: ${ultimaVenta.subtotal.toLocaleString()}
                  {ultimaVenta.descuentoTotal > 0 && ` - Descuento: $${ultimaVenta.descuentoTotal.toLocaleString()}`}
                  {ultimaVenta.recargo > 0 && ` + Recargo: $${ultimaVenta.recargo.toLocaleString()}`})
                </span>
              )}
              {ultimaVenta.promociones.length > 0 && (
                <div className="mt-2 text-xs sm:text-sm flex flex-wrap justify-center gap-1">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Panel de Productos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">
                  {categoriaActual
                    ? PRODUCTOS_POR_CATEGORIA[categoriaActual as keyof typeof PRODUCTOS_POR_CATEGORIA].nombre
                    : "Categorías"}
                </CardTitle>
                <div className="flex gap-1 sm:gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input
                      placeholder="Buscar..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="w-24 sm:w-48 text-xs sm:text-sm"
                    />
                    <Dialog open={modalManual} onOpenChange={setModalManual}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Manual</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Agregar Producto Manual</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="nombre-manual" className="text-sm">
                              Nombre del producto
                            </Label>
                            <Input
                              id="nombre-manual"
                              value={productoManual.nombre}
                              onChange={(e) => setProductoManual((prev) => ({ ...prev, nombre: e.target.value }))}
                              placeholder="Ej: Producto especial"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="precio-manual" className="text-sm">
                              Precio
                            </Label>
                            <Input
                              id="precio-manual"
                              type="number"
                              value={productoManual.precio}
                              onChange={(e) => setProductoManual((prev) => ({ ...prev, precio: e.target.value }))}
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <Button onClick={agregarProductoManual} className="w-full">
                            Agregar al Carrito
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {categoriaActual && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={volverACategorias}
                      className="text-xs sm:text-sm bg-transparent"
                    >
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Volver</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {busquedaProducto.trim() ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-600">
                      Resultados de búsqueda ({productosEncontrados.length})
                    </h4>
                    {productosEncontrados.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                        {productosEncontrados.map((producto) => (
                          <div
                            key={producto.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                            onClick={() => {
                              agregarProducto(producto)
                              setBusquedaProducto("") // Limpiar búsqueda después de agregar
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {producto.imagen ? (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image
                                    src={producto.imagen || "/placeholder.svg"}
                                    alt={producto.nombre}
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base truncate">{producto.nombre}</h4>
                                <p className="text-green-600 font-semibold text-sm sm:text-base">${producto.precio}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8 text-sm">No se encontraron productos</p>
                    )}
                  </div>
                ) : !categoriaActual ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(PRODUCTOS_POR_CATEGORIA).map(([key, categoria]) => (
                      <div
                        key={key}
                        className="p-4 sm:p-6 border-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all text-center active:bg-blue-100"
                        onClick={() => setCategoriaActual(key)}
                      >
                        <h3 className="text-lg sm:text-xl font-semibold text-[rgba(188,149,54,1)]">
                          {categoria.nombre}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                          {categoria.productos.length} productos
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                    {PRODUCTOS_POR_CATEGORIA[categoriaActual as keyof typeof PRODUCTOS_POR_CATEGORIA].productos.map(
                      (producto) => (
                        <div
                          key={producto.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={() => agregarProducto(producto)}
                        >
                          <div className="flex items-center gap-3">
                            {producto.imagen ? (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={producto.imagen || "/placeholder.svg"}
                                  alt={producto.nombre}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{producto.nombre}</h4>
                              <p className="text-base sm:text-lg font-bold text-green-600">
                                ${producto.precio.toLocaleString()}
                              </p>
                            </div>
                          </div>
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
                <CardTitle className="text-lg sm:text-xl">Venta Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Items del carrito */}
                <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                  {carrito.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">
                      Selecciona productos para comenzar la venta
                    </p>
                  ) : (
                    carrito.map((item) => (
                      <div
                        key={item.producto.id}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <h4 className="font-medium text-xs sm:text-sm truncate">{item.producto.nombre}</h4>
                          <p className="text-xs text-gray-600">${item.producto.precio.toLocaleString()} c/u</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-medium text-xs sm:text-sm">{item.cantidad}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            className="text-white bg-[rgba(188,149,54,1)] h-7 w-7 sm:h-8 sm:w-8 p-0"
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarProducto(item.producto.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="ml-1 sm:ml-2 font-bold text-xs sm:text-sm min-w-0">
                          ${(item.producto.precio * item.cantidad).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Promociones detectadas */}
                {promocionesDetectadas.length > 0 && carrito.length > 0 && (
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <Label className="text-xs sm:text-sm font-medium">Promociones disponibles:</Label>
                    </div>
                    <div className="space-y-2">
                      {promocionesDetectadas.map((promo) => (
                        <div
                          key={promo.promocion.id}
                          className={`p-2 sm:p-3 rounded-lg border ${
                            promo.aplicable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-medium text-xs sm:text-sm ${promo.aplicable ? "text-green-800" : "text-gray-600"} truncate`}
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
                            <div className="text-right flex-shrink-0">
                              {promo.aplicable && (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
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
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs sm:text-sm font-medium">Descuentos manuales:</Label>
                      {descuentoAplicado > 0 && (
                        <Button size="sm" variant="ghost" onClick={quitarDescuento} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                      {descuentos.map((descuento) => (
                        <Button
                          key={descuento.id}
                          size="sm"
                          variant={descuentoAplicado === descuento.porcentaje / 100 ? "default" : "outline"}
                          onClick={() => aplicarDescuento(descuento.porcentaje)}
                          disabled={descuentoAplicado === descuento.porcentaje / 100}
                          className="text-xs sm:text-sm"
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
                  <div className="border-t pt-3 sm:pt-4 space-y-1 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg">Subtotal:</span>
                      <span className="text-base sm:text-lg">${calcularSubtotal().toLocaleString()}</span>
                    </div>

                    {calcularDescuentoManual() > 0 && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span className="text-xs sm:text-sm">
                          Descuento manual ({(descuentoAplicado * 100).toFixed(0)}%):
                        </span>
                        <span className="text-xs sm:text-sm">-${calcularDescuentoManual().toLocaleString()}</span>
                      </div>
                    )}

                    {descuentoTotal > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-xs sm:text-sm">
                          Promociones (
                          {promocionesAplicables.length > 1
                            ? `${promocionesAplicables.length} aplicadas`
                            : promocionesAplicables[0]?.promocion.nombre}
                          ):
                        </span>
                        <span className="text-xs sm:text-sm">-${descuentoTotal.toLocaleString()}</span>
                      </div>
                    )}

                    {obtenerRecargo() !== 0 && (
                      <div
                        className={`flex justify-between items-center ${obtenerRecargo() > 0 ? "text-orange-600" : "text-green-600"}`}
                      >
                        <span className="text-xs sm:text-sm">
                          {obtenerRecargo() > 0 ? "Recargo" : "Descuento"} ({obtenerNombreMedioPago(medioPago)}):
                        </span>
                        <span className="text-xs sm:text-sm">
                          {obtenerRecargo() > 0 ? "+" : ""}${obtenerRecargo().toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-lg sm:text-xl font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">${calcularTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Medio de pago */}
                {carrito.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="medio-pago" className="text-sm">
                      Medio de Pago
                    </Label>
                    <Select value={medioPago} onValueChange={setMedioPago}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Seleccionar medio de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediosPago.map((medio) => (
                          <SelectItem key={medio.id} value={medio.id} className="text-sm">
                            {medio.nombre}
                            {medio.recargo !== 0 && (
                              <span
                                className={`ml-2 text-xs ${medio.recargo > 0 ? "text-orange-600" : "text-green-600"}`}
                              >
                                ({medio.recargo > 0 ? "+" : ""}
                                {medio.recargo}%)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <Button
                    onClick={procesarVenta}
                    disabled={carrito.length === 0 || !medioPago}
                    className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                  >
                    Procesar Venta
                  </Button>
                  <Button
                    onClick={nuevaVenta}
                    variant="outline"
                    disabled={carrito.length === 0}
                    className="text-sm sm:text-base py-2 sm:py-3 bg-transparent"
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
