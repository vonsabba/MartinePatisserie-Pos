"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  X,
  Gift,
  Receipt,
  Edit,
  Trash2,
  Save,
  Download,
  FileSpreadsheet,
  FileText,
  Activity,
  User,
  LogOut,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppContext } from "@/contexts/app-context"

interface Venta {
  id: string
  fecha: string
  items: Array<{
    producto: { id: number; nombre: string; precio: number }
    cantidad: number
  }>
  subtotal: number
  descuentoManual: number
  descuentoPromociones: number
  promocionesAplicadas: string[]
  recargo: number
  total: number
  medioPago: string
  nombreMedioPago: string
  usuario: string // Agregando campo usuario a la interfaz
}

export default function VentasPage() {
  const { ventas, editarVenta, eliminarVenta, mediosPago, usuarioActual, isAdmin, logout } = useAppContext()
  const [busqueda, setBusqueda] = useState("")
  const [filtroMedioPago, setFiltroMedioPago] = useState("all")
  const [filtroFecha, setFiltroFecha] = useState("all")
  const [filtroUsuario, setFiltroUsuario] = useState("all") // Agregando filtro por usuario
  const [vistaActual, setVistaActual] = useState<"todas" | "hoy" | "mes">("todas")
  const [ventaEditando, setVentaEditando] = useState<Venta | null>(null)
  const [modalEditar, setModalEditar] = useState(false)
  const [formEditar, setFormEditar] = useState({
    fecha: "",
    medioPago: "",
  })

  // Obtener fechas únicas para el filtro
  const fechasUnicas = useMemo(() => {
    const fechas = ventas.map((venta) => {
      const fecha = new Date(venta.fecha)
      return fecha.toISOString().split("T")[0] // YYYY-MM-DD
    })
    return [...new Set(fechas)].sort().reverse()
  }, [ventas])

  // Obtener medios de pago únicos
  const mediosPagoUnicos = useMemo(() => {
    const medios = ventas.map((venta) => venta.nombreMedioPago)
    return [...new Set(medios)].sort()
  }, [ventas])

  const usuariosUnicos = useMemo(() => {
    const usuarios = ventas.map((venta) => venta.usuario || "Sin usuario").filter(Boolean)
    return [...new Set(usuarios)].sort()
  }, [ventas])

  const ventasFiltradas = useMemo(() => {
    let ventasFiltradasTemp = [...ventas]

    // Filtro por vista (hoy, mes, todas)
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    if (vistaActual === "hoy") {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return fechaVenta >= inicioHoy
      })
    } else if (vistaActual === "mes") {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return fechaVenta >= inicioMes
      })
    }

    // Filtro por búsqueda (productos)
    if (busqueda) {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) =>
        venta.items.some((item) => item.producto.nombre.toLowerCase().includes(busqueda.toLowerCase())),
      )
    }

    // Filtro por medio de pago
    if (filtroMedioPago !== "all") {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) => venta.nombreMedioPago === filtroMedioPago)
    }

    // Filtro por fecha específica
    if (filtroFecha !== "all") {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) => {
        const fechaVenta = new Date(venta.fecha).toISOString().split("T")[0]
        return fechaVenta === filtroFecha
      })
    }

    if (filtroUsuario !== "all") {
      ventasFiltradasTemp = ventasFiltradasTemp.filter((venta) => (venta.usuario || "Sin usuario") === filtroUsuario)
    }

    return ventasFiltradasTemp
  }, [ventas, busqueda, filtroMedioPago, filtroFecha, filtroUsuario, vistaActual])

  // Agrupar ventas por fecha
  const ventasAgrupadasPorFecha = useMemo(() => {
    const grupos: { [fecha: string]: Venta[] } = {}

    ventasFiltradas.forEach((venta) => {
      const fecha = new Date(venta.fecha).toISOString().split("T")[0]
      if (!grupos[fecha]) {
        grupos[fecha] = []
      }
      grupos[fecha].push(venta)
    })

    // Ordenar fechas de más reciente a más antigua
    const fechasOrdenadas = Object.keys(grupos).sort().reverse()
    const gruposOrdenados: { [fecha: string]: Venta[] } = {}

    fechasOrdenadas.forEach((fecha) => {
      gruposOrdenados[fecha] = grupos[fecha].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    })

    return gruposOrdenados
  }, [ventasFiltradas])

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const totalVentas = ventasFiltradas.length
    const totalFacturado = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)
    const promedioVenta = totalVentas > 0 ? totalFacturado / totalVentas : 0

    // Producto más vendido
    const productosVendidos: { [nombre: string]: number } = {}
    ventasFiltradas.forEach((venta) => {
      venta.items.forEach((item) => {
        productosVendidos[item.producto.nombre] = (productosVendidos[item.producto.nombre] || 0) + item.cantidad
      })
    })

    const productoMasVendido = Object.entries(productosVendidos).reduce(
      (max, [nombre, cantidad]) => (cantidad > max.cantidad ? { nombre, cantidad } : max),
      { nombre: "Ninguno", cantidad: 0 },
    )

    // Medio de pago más usado
    const mediosPago: { [medio: string]: number } = {}
    ventasFiltradas.forEach((venta) => {
      mediosPago[venta.nombreMedioPago] = (mediosPago[venta.nombreMedioPago] || 0) + 1
    })

    const medioMasUsado = Object.entries(mediosPago).reduce(
      (max, [medio, cantidad]) => (cantidad > max.cantidad ? { medio, cantidad } : max),
      { medio: "Ninguno", cantidad: 0 },
    )

    return {
      totalVentas,
      totalFacturado,
      promedioVenta,
      productoMasVendido,
      medioMasUsado,
    }
  }, [ventasFiltradas])

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearHora = (fechaISO: string) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const limpiarFiltros = () => {
    setBusqueda("")
    setFiltroMedioPago("all")
    setFiltroFecha("all")
    setFiltroUsuario("all") // Limpiar filtro de usuario
    setVistaActual("todas")
  }

  const abrirModalEditar = (venta: Venta) => {
    setVentaEditando(venta)
    const fechaLocal = new Date(venta.fecha)
    const fechaFormateada = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)

    setFormEditar({
      fecha: fechaFormateada,
      medioPago: venta.medioPago,
    })
    setModalEditar(true)
  }

  const guardarEdicion = () => {
    if (!ventaEditando || !formEditar.fecha || !formEditar.medioPago) return

    const medioSeleccionado = mediosPago.find((m) => m.id === formEditar.medioPago)
    if (!medioSeleccionado) return

    // Recalcular recargo y total con el nuevo medio de pago
    const subtotalConDescuento =
      ventaEditando.subtotal - ventaEditando.descuentoManual - ventaEditando.descuentoPromociones
    let nuevoRecargo = 0
    let nuevoTotal = subtotalConDescuento

    if (formEditar.medioPago !== "efectivo") {
      const factorRecargo = formEditar.medioPago === "tarjeta" || formEditar.medioPago === "transferencia" ? 1.24 : 1
      nuevoTotal = Math.ceil((subtotalConDescuento * factorRecargo) / 100) * 100
      nuevoRecargo = nuevoTotal - subtotalConDescuento
    }

    const ventaEditada = {
      ...ventaEditando,
      fecha: new Date(formEditar.fecha).toISOString(),
      medioPago: formEditar.medioPago,
      nombreMedioPago: medioSeleccionado.nombre,
      recargo: nuevoRecargo,
      total: nuevoTotal,
    }

    editarVenta(ventaEditando.id, ventaEditada)
    setModalEditar(false)
    setVentaEditando(null)
  }

  const confirmarEliminar = (ventaId: string) => {
    eliminarVenta(ventaId)
  }

  // Funciones de exportación
  const exportarExcel = () => {
    // Preparar datos para Excel
    const datosExcel = ventasFiltradas.map((venta) => {
      const fecha = new Date(venta.fecha)
      const productos = venta.items.map((item) => `${item.cantidad}x ${item.producto.nombre}`).join(", ")
      const promociones = venta.promocionesAplicadas.join(", ")

      return {
        "ID Venta": venta.id.split("-").pop(),
        Fecha: fecha.toLocaleDateString("es-AR"),
        Hora: fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        Productos: productos,
        Subtotal: venta.subtotal,
        "Descuento Manual": venta.descuentoManual,
        "Descuento Promociones": venta.descuentoPromociones,
        Promociones: promociones,
        Recargo: venta.recargo,
        Total: venta.total,
        "Medio de Pago": venta.nombreMedioPago,
      }
    })

    // Crear CSV (compatible con Excel)
    const headers = Object.keys(datosExcel[0] || {})
    const csvContent = [
      headers.join(","),
      ...datosExcel.map((fila) =>
        headers
          .map((header) => {
            const valor = fila[header as keyof typeof fila]
            // Escapar comillas y envolver en comillas si contiene comas
            const valorStr = String(valor || "")
            return valorStr.includes(",") ? `"${valorStr.replace(/"/g, '""')}"` : valorStr
          })
          .join(","),
      ),
    ].join("\n")

    // Descargar archivo
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ventas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarPDF = () => {
    // Crear contenido HTML para el PDF
    const fechaReporte = new Date().toLocaleDateString("es-AR")
    const totalVentas = ventasFiltradas.length
    const totalFacturado = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Ventas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .stats { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f5f5f5; padding: 15px; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 12px; color: #666; }
          .day-section { margin-bottom: 30px; }
          .day-header { background: #2563eb; color: white; padding: 10px; font-weight: bold; }
          .sale { border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; }
          .sale-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
          .sale-items { margin-bottom: 10px; }
          .sale-item { display: flex; justify-content: space-between; padding: 2px 0; }
          .sale-footer { border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #666; }
          .total { font-size: 18px; font-weight: bold; color: #16a34a; }
          .promociones { background: #dcfce7; padding: 5px; border-radius: 3px; margin: 5px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Ventas</h1>
          <p>Generado el ${fechaReporte}</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${totalVentas}</div>
            <div class="stat-label">Total Ventas</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${totalFacturado.toLocaleString()}</div>
            <div class="stat-label">Total Facturado</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${Math.round(totalFacturado / totalVentas || 0).toLocaleString()}</div>
            <div class="stat-label">Promedio por Venta</div>
          </div>
        </div>
    `

    // Agregar ventas agrupadas por fecha
    Object.entries(ventasAgrupadasPorFecha).forEach(([fecha, ventasDelDia]) => {
      const totalDelDia = ventasDelDia.reduce((sum, venta) => sum + venta.total, 0)
      const fechaFormateada = formatearFecha(fecha + "T00:00:00")

      htmlContent += `
        <div class="day-section">
          <div class="day-header">
            ${fechaFormateada} - ${ventasDelDia.length} ventas - $${totalDelDia.toLocaleString()}
          </div>
      `

      ventasDelDia.forEach((venta) => {
        const hora = formatearHora(venta.fecha)
        const productos = venta.items
          .map(
            (item) =>
              `<div class="sale-item"><span>${item.cantidad}x ${item.producto.nombre}</span><span>$${(item.producto.precio * item.cantidad).toLocaleString()}</span></div>`,
          )
          .join("")

        const promociones =
          venta.promocionesAplicadas.length > 0
            ? `<div class="promociones">🎁 Promociones: ${venta.promocionesAplicadas.join(", ")}</div>`
            : ""

        htmlContent += `
          <div class="sale">
            <div class="sale-header">
              <span>Venta #${venta.id.split("-").pop()} - ${hora}</span>
              <span class="total">$${venta.total.toLocaleString()}</span>
            </div>
            <div class="sale-items">
              ${productos}
            </div>
            ${promociones}
            <div class="sale-footer">
              Medio de pago: ${venta.nombreMedioPago}
              ${venta.descuentoManual > 0 ? ` | Descuento manual: $${venta.descuentoManual.toLocaleString()}` : ""}
              ${venta.descuentoPromociones > 0 ? ` | Descuento promociones: $${venta.descuentoPromociones.toLocaleString()}` : ""}
              ${venta.recargo > 0 ? ` | Recargo: $${venta.recargo.toLocaleString()}` : ""}
            </div>
          </div>
        `
      })

      htmlContent += `</div>`
    })

    htmlContent += `
      </body>
      </html>
    `

    // Abrir en nueva ventana para imprimir/guardar como PDF
    const ventana = window.open("", "_blank")
    if (ventana) {
      ventana.document.write(htmlContent)
      ventana.document.close()

      // Esperar a que se cargue y luego mostrar diálogo de impresión
      ventana.onload = () => {
        setTimeout(() => {
          ventana.print()
        }, 500)
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
            <Link href="/">
              <Button>Volver al POS</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/mp-logo.svg" alt="MP Logo" width={150} height={60} className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Registro de Ventas</h1>
              <p className="text-sm text-gray-600">
                Usuario: <strong>{usuarioActual?.nombre}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar ({ventasFiltradas.length} ventas)
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportarExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar a Excel (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportarPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar a PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/estadisticas">
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Estadísticas
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al POS
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as "todas" | "hoy" | "mes")}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="todas">Todas las Ventas</TabsTrigger>
            <TabsTrigger value="hoy">Hoy</TabsTrigger>
            <TabsTrigger value="mes">Este Mes</TabsTrigger>
          </TabsList>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                    <p className="text-2xl font-bold">{estadisticas.totalVentas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Facturado</p>
                    <p className="text-2xl font-bold">${estadisticas.totalFacturado.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Promedio por Venta</p>
                    <p className="text-2xl font-bold">${estadisticas.promedioVenta.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Más Vendido</p>
                    <p className="text-sm font-bold truncate">{estadisticas.productoMasVendido.nombre}</p>
                    <p className="text-xs text-gray-500">({estadisticas.productoMasVendido.cantidad} unidades)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Medio Preferido</p>
                    <p className="text-sm font-bold">{estadisticas.medioMasUsado.medio}</p>
                    <p className="text-xs text-gray-500">({estadisticas.medioMasUsado.cantidad} veces)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="todas" className="space-y-6">
            <VentasContent
              ventasAgrupadasPorFecha={ventasAgrupadasPorFecha}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              filtroMedioPago={filtroMedioPago}
              setFiltroMedioPago={setFiltroMedioPago}
              filtroFecha={filtroFecha}
              setFiltroFecha={setFiltroFecha}
              filtroUsuario={filtroUsuario}
              setFiltroUsuario={setFiltroUsuario}
              fechasUnicas={fechasUnicas}
              mediosPagoUnicos={mediosPagoUnicos}
              usuariosUnicos={usuariosUnicos}
              limpiarFiltros={limpiarFiltros}
              formatearFecha={formatearFecha}
              formatearHora={formatearHora}
              onEditarVenta={abrirModalEditar}
              onEliminarVenta={confirmarEliminar}
            />
          </TabsContent>

          <TabsContent value="hoy" className="space-y-6">
            <VentasContent
              ventasAgrupadasPorFecha={ventasAgrupadasPorFecha}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              filtroMedioPago={filtroMedioPago}
              setFiltroMedioPago={setFiltroMedioPago}
              filtroFecha={filtroFecha}
              setFiltroFecha={setFiltroFecha}
              filtroUsuario={filtroUsuario}
              setFiltroUsuario={setFiltroUsuario}
              fechasUnicas={fechasUnicas}
              mediosPagoUnicos={mediosPagoUnicos}
              usuariosUnicos={usuariosUnicos}
              limpiarFiltros={limpiarFiltros}
              formatearFecha={formatearFecha}
              formatearHora={formatearHora}
              onEditarVenta={abrirModalEditar}
              onEliminarVenta={confirmarEliminar}
            />
          </TabsContent>

          <TabsContent value="mes" className="space-y-6">
            <VentasContent
              ventasAgrupadasPorFecha={ventasAgrupadasPorFecha}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              filtroMedioPago={filtroMedioPago}
              setFiltroMedioPago={setFiltroMedioPago}
              filtroFecha={filtroFecha}
              setFiltroFecha={setFiltroFecha}
              filtroUsuario={filtroUsuario}
              setFiltroUsuario={setFiltroUsuario}
              fechasUnicas={fechasUnicas}
              mediosPagoUnicos={mediosPagoUnicos}
              usuariosUnicos={usuariosUnicos}
              limpiarFiltros={limpiarFiltros}
              formatearFecha={formatearFecha}
              formatearHora={formatearHora}
              onEditarVenta={abrirModalEditar}
              onEliminarVenta={confirmarEliminar}
            />
          </TabsContent>
        </Tabs>

        {/* Modal de Edición */}
        <Dialog open={modalEditar} onOpenChange={setModalEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Venta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fecha-editar">Fecha y Hora</Label>
                <Input
                  id="fecha-editar"
                  type="datetime-local"
                  value={formEditar.fecha}
                  onChange={(e) => setFormEditar((prev) => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="medio-pago-editar">Medio de Pago</Label>
                <Select
                  value={formEditar.medioPago}
                  onValueChange={(value) => setFormEditar((prev) => ({ ...prev, medioPago: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediosPago.map((medio) => (
                      <SelectItem key={medio.id} value={medio.id}>
                        {medio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={guardarEdicion} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setModalEditar(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Componente separado para el contenido de ventas
function VentasContent({
  ventasAgrupadasPorFecha,
  busqueda,
  setBusqueda,
  filtroMedioPago,
  setFiltroMedioPago,
  filtroFecha,
  setFiltroFecha,
  filtroUsuario,
  setFiltroUsuario,
  fechasUnicas,
  mediosPagoUnicos,
  usuariosUnicos,
  limpiarFiltros,
  formatearFecha,
  formatearHora,
  onEditarVenta,
  onEliminarVenta,
}: {
  ventasAgrupadasPorFecha: { [fecha: string]: Venta[] }
  busqueda: string
  setBusqueda: (value: string) => void
  filtroMedioPago: string
  setFiltroMedioPago: (value: string) => void
  filtroFecha: string
  setFiltroFecha: (value: string) => void
  filtroUsuario: string
  setFiltroUsuario: (value: string) => void
  fechasUnicas: string[]
  mediosPagoUnicos: string[]
  usuariosUnicos: string[]
  limpiarFiltros: () => void
  formatearFecha: (fecha: string) => string
  formatearHora: (fecha: string) => string
  onEditarVenta: (venta: Venta) => void
  onEliminarVenta: (ventaId: string) => void
}) {
  const hayFiltrosActivos = busqueda || filtroMedioPago !== "all" || filtroFecha !== "all" || filtroUsuario !== "all"

  return (
    <>
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hayFiltrosActivos && (
              <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busqueda">Buscar por producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="busqueda"
                  placeholder="Ej: Cookie, Alfajor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="medio-pago">Filtrar por medio de pago</Label>
              <Select value={filtroMedioPago} onValueChange={setFiltroMedioPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los medios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los medios</SelectItem>
                  {mediosPagoUnicos.map((medio) => (
                    <SelectItem key={medio} value={medio}>
                      {medio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fecha">Filtrar por fecha</Label>
              <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  {fechasUnicas.map((fecha) => (
                    <SelectItem key={fecha} value={fecha}>
                      {new Date(fecha).toLocaleDateString("es-AR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="usuario">Filtrar por usuario</Label>
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {usuariosUnicos.map((usuario) => (
                    <SelectItem key={usuario} value={usuario}>
                      {usuario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ventas agrupadas por fecha */}
      <div className="space-y-6">
        {Object.keys(ventasAgrupadasPorFecha).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No se encontraron ventas con los filtros aplicados</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(ventasAgrupadasPorFecha).map(([fecha, ventasDelDia]) => {
            const totalDelDia = ventasDelDia.reduce((sum, venta) => sum + venta.total, 0)

            return (
              <div key={fecha} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 capitalize">
                    <Calendar className="inline h-5 w-5 mr-2" />
                    {formatearFecha(fecha + "T00:00:00")}
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{ventasDelDia.length} ventas</p>
                    <p className="text-lg font-bold text-green-600">${totalDelDia.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {ventasDelDia.map((venta) => (
                    <Card key={venta.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Venta #{venta.id.split("-").pop()} - {formatearHora(venta.fecha)}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{venta.nombreMedioPago}</Badge>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <User className="h-3 w-3 mr-1" />
                                {venta.usuario || "Sin usuario"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">${venta.total.toLocaleString()}</p>
                              {(venta.descuentoManual > 0 || venta.descuentoPromociones > 0) && (
                                <p className="text-xs text-gray-500">(Subtotal: ${venta.subtotal.toLocaleString()})</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEditarVenta(venta)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. La venta será eliminada permanentemente del
                                      registro.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onEliminarVenta(venta.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>

                        {/* Items de la venta */}
                        <div className="space-y-2 mb-3">
                          {venta.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>
                                {item.cantidad}x {item.producto.nombre}
                              </span>
                              <span className="font-medium">
                                ${(item.producto.precio * item.cantidad).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Promociones aplicadas */}
                        {venta.promocionesAplicadas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {venta.promocionesAplicadas.map((promocion, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                <Gift className="h-3 w-3 mr-1" />
                                {promocion}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Desglose de descuentos y recargos */}
                        {(venta.descuentoManual > 0 || venta.descuentoPromociones > 0 || venta.recargo > 0) && (
                          <div className="text-xs text-gray-600 space-y-1 border-t pt-2">
                            {venta.descuentoManual > 0 && (
                              <div className="flex justify-between">
                                <span>Descuento manual:</span>
                                <span className="text-blue-600">-${venta.descuentoManual.toLocaleString()}</span>
                              </div>
                            )}
                            {venta.descuentoPromociones > 0 && (
                              <div className="flex justify-between">
                                <span>Descuento promociones:</span>
                                <span className="text-green-600">-${venta.descuentoPromociones.toLocaleString()}</span>
                              </div>
                            )}
                            {venta.recargo > 0 && (
                              <div className="flex justify-between">
                                <span>Recargo ({venta.nombreMedioPago}):</span>
                                <span className="text-orange-600">+${venta.recargo.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
