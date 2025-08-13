"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Gift,
  CreditCard,
  Clock,
  CalendarIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppContext } from "@/contexts/app-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Tooltip,
} from "recharts"

const COLORES_GRAFICO = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
]

export default function EstadisticasPage() {
  const { ventas, productos } = useAppContext()
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("30d")
  const [fechaInicio, setFechaInicio] = useState<Date>()
  const [fechaFin, setFechaFin] = useState<Date>()
  const [mesSeleccionado, setMesSeleccionado] = useState("")

  const ventasFiltradas = useMemo(() => {
    const ahora = new Date()
    let fechaLimite: Date

    if (periodoSeleccionado === "personalizado" && fechaInicio && fechaFin) {
      return ventas.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return fechaVenta >= fechaInicio && fechaVenta <= fechaFin
      })
    }

    if (periodoSeleccionado.startsWith("mes-")) {
      const [, year, month] = periodoSeleccionado.split("-")
      return ventas.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return (
          fechaVenta.getFullYear() === Number.parseInt(year) && fechaVenta.getMonth() === Number.parseInt(month) - 1
        )
      })
    }

    switch (periodoSeleccionado) {
      case "7d":
        fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        fechaLimite = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        return ventas
    }

    return ventas.filter((venta) => new Date(venta.fecha) >= fechaLimite)
  }, [ventas, periodoSeleccionado, fechaInicio, fechaFin])

  const metricas = useMemo(() => {
    const totalVentas = ventasFiltradas.length
    const totalFacturado = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)
    const totalDescuentos = ventasFiltradas.reduce(
      (sum, venta) => sum + venta.descuentoManual + venta.descuentoPromociones,
      0,
    )
    const totalRecargos = ventasFiltradas.reduce((sum, venta) => sum + venta.recargo, 0)
    const promedioVenta = totalVentas > 0 ? totalFacturado / totalVentas : 0

    const diasPeriodo = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      todo: 365,
    }[periodoSeleccionado]

    const fechaInicioAnterior = new Date(Date.now() - diasPeriodo * 2 * 24 * 60 * 60 * 1000)
    const fechaFinAnterior = new Date(Date.now() - diasPeriodo * 24 * 60 * 60 * 1000)

    const ventasPeriodoAnterior = ventas.filter((venta) => {
      const fechaVenta = new Date(venta.fecha)
      return fechaVenta >= fechaInicioAnterior && fechaVenta < fechaFinAnterior
    })

    const totalFacturadoAnterior = ventasPeriodoAnterior.reduce((sum, venta) => sum + venta.total, 0)
    const crecimiento =
      totalFacturadoAnterior > 0 ? ((totalFacturado - totalFacturadoAnterior) / totalFacturadoAnterior) * 100 : 0

    return {
      totalVentas,
      totalFacturado,
      totalDescuentos,
      totalRecargos,
      promedioVenta,
      crecimiento,
      ventasPorDia: totalVentas / diasPeriodo,
    }
  }, [ventasFiltradas, ventas, periodoSeleccionado])

  const analisisProductos = useMemo(() => {
    const productosVendidos: {
      [nombre: string]: {
        cantidad: number
        ingresos: number
        ventas: number
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      venta.items.forEach((item) => {
        const nombre = item.producto.nombre
        if (!productosVendidos[nombre]) {
          productosVendidos[nombre] = {
            cantidad: 0,
            ingresos: 0,
            ventas: 0,
          }
        }
        productosVendidos[nombre].cantidad += item.cantidad
        productosVendidos[nombre].ingresos += item.producto.precio * item.cantidad
        productosVendidos[nombre].ventas += 1
      })
    })

    const productosArray = Object.entries(productosVendidos).map(([nombre, datos]) => ({
      nombre,
      ...datos,
      promedioVenta: datos.ingresos / datos.ventas,
    }))

    return {
      masVendidos: productosArray.sort((a, b) => b.cantidad - a.cantidad).slice(0, 10),
      masRentables: productosArray.sort((a, b) => b.ingresos - a.ingresos).slice(0, 10),
    }
  }, [ventasFiltradas])

  const analisisTemporal = useMemo(() => {
    const ventasPorDia: { [fecha: string]: { ventas: number; ingresos: number } } = {}
    const ventasPorHora: { [hora: number]: { ventas: number; ingresos: number } } = {}
    const ventasPorDiaSemana: { [dia: number]: { ventas: number; ingresos: number } } = {}
    const ventasPorMes: { [mes: string]: { ventas: number; ingresos: number } } = {}

    for (let i = 0; i < 24; i++) {
      ventasPorHora[i] = { ventas: 0, ingresos: 0 }
    }

    for (let i = 0; i < 7; i++) {
      ventasPorDiaSemana[i] = { ventas: 0, ingresos: 0 }
    }

    ventasFiltradas.forEach((venta) => {
      const fecha = new Date(venta.fecha)
      const fechaStr = fecha.toISOString().split("T")[0]
      const hora = fecha.getHours()
      const diaSemana = fecha.getDay()
      const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`

      if (!ventasPorDia[fechaStr]) {
        ventasPorDia[fechaStr] = { ventas: 0, ingresos: 0 }
      }
      ventasPorDia[fechaStr].ventas += 1
      ventasPorDia[fechaStr].ingresos += venta.total

      ventasPorHora[hora].ventas += 1
      ventasPorHora[hora].ingresos += venta.total

      ventasPorDiaSemana[diaSemana].ventas += 1
      ventasPorDiaSemana[diaSemana].ingresos += venta.total

      if (!ventasPorMes[mesStr]) {
        ventasPorMes[mesStr] = { ventas: 0, ingresos: 0 }
      }
      ventasPorMes[mesStr].ventas += 1
      ventasPorMes[mesStr].ingresos += venta.total
    })

    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return {
      porDia: Object.entries(ventasPorDia)
        .map(([fecha, datos]) => ({
          fecha,
          fechaFormateada: new Date(fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
          ...datos,
        }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
      porHora: Object.entries(ventasPorHora).map(([hora, datos]) => ({
        hora: `${hora}:00`,
        horaNum: Number.parseInt(hora),
        ...datos,
      })),
      porDiaSemana: Object.entries(ventasPorDiaSemana).map(([dia, datos]) => ({
        dia: diasSemana[Number.parseInt(dia)],
        diaNum: Number.parseInt(dia),
        ...datos,
      })),
      porMes: Object.entries(ventasPorMes)
        .map(([mes, datos]) => {
          const [year, monthNum] = mes.split("-")
          return {
            mes,
            mesFormateado: `${meses[Number.parseInt(monthNum) - 1]} ${year}`,
            ...datos,
          }
        })
        .sort((a, b) => a.mes.localeCompare(b.mes)),
    }
  }, [ventasFiltradas])

  const analisisPromociones = useMemo(() => {
    const promocionesUsadas: {
      [nombre: string]: {
        vecesAplicada: number
        descuentoTotal: number
        ventasAfectadas: number
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      venta.promocionesAplicadas.forEach((promocion) => {
        if (!promocionesUsadas[promocion]) {
          promocionesUsadas[promocion] = {
            vecesAplicada: 0,
            descuentoTotal: 0,
            ventasAfectadas: 0,
          }
        }
        promocionesUsadas[promocion].vecesAplicada += 1
        promocionesUsadas[promocion].descuentoTotal += venta.descuentoPromociones
        promocionesUsadas[promocion].ventasAfectadas += 1
      })
    })

    return Object.entries(promocionesUsadas)
      .map(([nombre, datos]) => ({
        nombre,
        ...datos,
        promedioDescuento: datos.descuentoTotal / datos.vecesAplicada,
      }))
      .sort((a, b) => b.descuentoTotal - a.descuentoTotal)
  }, [ventasFiltradas])

  const analisisMediosPago = useMemo(() => {
    const mediosPagoUsados: {
      [medio: string]: {
        cantidad: number
        ingresos: number
        recargos: number
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      const medio = venta.nombreMedioPago
      if (!mediosPagoUsados[medio]) {
        mediosPagoUsados[medio] = {
          cantidad: 0,
          ingresos: 0,
          recargos: 0,
        }
      }
      mediosPagoUsados[medio].cantidad += 1
      mediosPagoUsados[medio].ingresos += venta.total
      mediosPagoUsados[medio].recargos += venta.recargo
    })

    return Object.entries(mediosPagoUsados)
      .map(([medio, datos]) => ({
        medio,
        ...datos,
        promedioVenta: datos.ingresos / datos.cantidad,
        porcentajeUso: (datos.cantidad / ventasFiltradas.length) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [ventasFiltradas])

  const analisisCategorias = useMemo(() => {
    const categoriasVendidas: {
      [categoria: string]: {
        cantidad: number
        ingresos: number
        productos: Set<string>
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      venta.items.forEach((item) => {
        // Encontrar la categoría del producto
        let categoriaEncontrada = "Sin categoría"
        Object.entries(productos).forEach(([catKey, categoria]) => {
          const productoExiste = categoria.productos.find((p) => p.id === item.producto.id)
          if (productoExiste) {
            categoriaEncontrada = categoria.nombre
          }
        })

        if (!categoriasVendidas[categoriaEncontrada]) {
          categoriasVendidas[categoriaEncontrada] = {
            cantidad: 0,
            ingresos: 0,
            productos: new Set(),
          }
        }
        categoriasVendidas[categoriaEncontrada].cantidad += item.cantidad
        categoriasVendidas[categoriaEncontrada].ingresos += item.producto.precio * item.cantidad
        categoriasVendidas[categoriaEncontrada].productos.add(item.producto.nombre)
      })
    })

    return Object.entries(categoriasVendidas)
      .map(([categoria, datos]) => ({
        categoria,
        cantidad: datos.cantidad,
        ingresos: datos.ingresos,
        productosUnicos: datos.productos.size,
        promedioVenta: datos.ingresos / datos.cantidad,
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
  }, [ventasFiltradas, productos])

  const formatearPeriodo = (periodo: string) => {
    if (periodo === "personalizado" && fechaInicio && fechaFin) {
      return `${fechaInicio.toLocaleDateString("es-AR")} - ${fechaFin.toLocaleDateString("es-AR")}`
    }

    if (periodo.startsWith("mes-")) {
      const [, year, month] = periodo.split("-")
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ]
      return `${meses[Number.parseInt(month) - 1]} ${year}`
    }

    const nombres = {
      "7d": "Últimos 7 días",
      "30d": "Últimos 30 días",
      "90d": "Últimos 90 días",
      todo: "Todo el tiempo",
    }
    return nombres[periodo as keyof typeof nombres]
  }

  const obtenerMesesDisponibles = () => {
    const mesesSet = new Set<string>()
    ventas.forEach((venta) => {
      const fecha = new Date(venta.fecha)
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
      mesesSet.add(mesKey)
    })

    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return Array.from(mesesSet)
      .sort()
      .map((mesKey) => {
        const [year, month] = mesKey.split("-")
        return {
          value: `mes-${mesKey}`,
          label: `${meses[Number.parseInt(month) - 1]} ${year}`,
        }
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/mp-logo.svg" alt="MP Logo" width={150} height={60} className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Estadísticas y Analytics</h1>
              <p className="text-gray-600">{formatearPeriodo(periodoSeleccionado)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={periodoSeleccionado} onValueChange={(value: any) => setPeriodoSeleccionado(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
                <SelectItem value="todo">Todo el tiempo</SelectItem>
                {obtenerMesesDisponibles().map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
                <SelectItem value="personalizado">Rango personalizado</SelectItem>
              </SelectContent>
            </Select>

            {periodoSeleccionado === "personalizado" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Seleccionar fechas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fecha inicio</Label>
                      <Input
                        type="date"
                        value={fechaInicio?.toISOString().split("T")[0] || ""}
                        onChange={(e) => setFechaInicio(new Date(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha fin</Label>
                      <Input
                        type="date"
                        value={fechaFin?.toISOString().split("T")[0] || ""}
                        onChange={(e) => setFechaFin(new Date(e.target.value))}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al POS
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                  <p className="text-3xl font-bold text-green-600">${metricas.totalFacturado.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    {metricas.crecimiento >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${metricas.crecimiento >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {metricas.crecimiento >= 0 ? "+" : ""}
                      {metricas.crecimiento.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-3xl font-bold text-blue-600">{metricas.totalVentas}</p>
                  <p className="text-sm text-gray-500 mt-2">{metricas.ventasPorDia.toFixed(1)} ventas/día promedio</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">${metricas.promedioVenta.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">Por venta realizada</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuentos Aplicados</p>
                  <p className="text-3xl font-bold text-orange-600">${metricas.totalDescuentos.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {((metricas.totalDescuentos / (metricas.totalFacturado + metricas.totalDescuentos)) * 100).toFixed(
                      1,
                    )}
                    % del total
                  </p>
                </div>
                <Gift className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="productos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="temporal">Temporal</TabsTrigger>
            <TabsTrigger value="promociones">Promociones</TabsTrigger>
            <TabsTrigger value="pagos">Medios de Pago</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top 10 - Más Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analisisProductos.masVendidos.map((producto, index) => (
                      <div
                        key={producto.nombre}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{producto.nombre}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{producto.cantidad} unidades</p>
                          <p className="text-sm text-gray-500">${producto.ingresos.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Top 10 - Más Rentables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analisisProductos.masRentables.map((producto, index) => (
                      <div
                        key={producto.nombre}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-sm text-gray-500">{producto.cantidad} unidades vendidas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${producto.ingresos.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">${producto.promedioVenta.toLocaleString()}/venta</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ventas por Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ingresos: {
                        label: "Ingresos",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analisisTemporal.porDia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fechaFormateada" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="ingresos"
                          stroke="var(--color-ingresos)"
                          fill="var(--color-ingresos)"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ventas por Hora del Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ventas: {
                        label: "Ventas",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analisisTemporal.porHora}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="ventas" fill="var(--color-ventas)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rendimiento por Día de la Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {analisisTemporal.porDiaSemana.map((dia) => (
                      <div key={dia.dia} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-600">{dia.dia}</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{dia.ventas}</p>
                        <p className="text-sm text-gray-500">ventas</p>
                        <p className="text-lg font-semibold text-green-600 mt-1">${dia.ingresos.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Ventas por Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ingresos: {
                        label: "Ingresos",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analisisTemporal.porMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mesFormateado" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="ingresos" fill="var(--color-ingresos)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="promociones" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Promociones Más Utilizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      descuentoTotal: {
                        label: "Descuento Total",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analisisPromociones}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="descuentoTotal" fill="var(--color-descuentoTotal)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Detalle de Promociones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analisisPromociones.map((promocion, index) => (
                      <div
                        key={promocion.nombre}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{promocion.nombre}</p>
                            <p className="text-sm text-gray-500">{promocion.vecesAplicada} veces aplicada</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">${promocion.descuentoTotal.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">${promocion.promedioDescuento.toLocaleString()}/uso</p>
                        </div>
                      </div>
                    ))}
                    {analisisPromociones.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No se aplicaron promociones en este período</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribución de Medios de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      cantidad: {
                        label: "Cantidad",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analisisMediosPago}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="cantidad"
                          nameKey="medio"
                          label={({ medio, porcentajeUso }) => `${medio}: ${porcentajeUso.toFixed(1)}%`}
                        >
                          {analisisMediosPago.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          labelFormatter={(label) => `Medio: ${label}`}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Detalles por Medio de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analisisMediosPago.map((medio, index) => (
                      <div key={medio.medio} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{medio.medio}</h4>
                          <Badge
                            variant="outline"
                            style={{ backgroundColor: COLORES_GRAFICO[index % COLORES_GRAFICO.length] + "20" }}
                          >
                            {medio.porcentajeUso.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Ventas</p>
                            <p className="font-semibold">{medio.cantidad}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Ingresos</p>
                            <p className="font-semibold">${medio.ingresos.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Promedio/Venta</p>
                            <p className="font-semibold">${medio.promedioVenta.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Recargos</p>
                            <p className="font-semibold">${medio.recargos.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ingresos por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ingresos: {
                        label: "Ingresos",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analisisCategorias} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="categoria" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="ingresos" fill="var(--color-ingresos)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Rendimiento por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analisisCategorias.map((categoria, index) => (
                      <div
                        key={categoria.categoria}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{categoria.categoria}</p>
                            <p className="text-sm text-gray-500">{categoria.productosUnicos} productos únicos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">${categoria.ingresos.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{categoria.cantidad} unidades</p>
                        </div>
                      </div>
                    ))}
                    {analisisCategorias.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No hay datos de categorías para mostrar</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
