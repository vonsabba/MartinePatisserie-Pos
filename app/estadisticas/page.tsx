"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<"7d" | "30d" | "90d" | "todo">("30d")

  // Filtrar ventas por período
  const ventasFiltradas = useMemo(() => {
    if (periodoSeleccionado === "todo") return ventas

    const hoy = new Date()
    const diasAtras = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    }[periodoSeleccionado]

    const fechaLimite = new Date(hoy.getTime() - diasAtras * 24 * 60 * 60 * 1000)

    return ventas.filter((venta) => new Date(venta.fecha) >= fechaLimite)
  }, [ventas, periodoSeleccionado])

  // Métricas generales
  const metricas = useMemo(() => {
    const totalVentas = ventasFiltradas.length
    const totalFacturado = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0)
    const totalDescuentos = ventasFiltradas.reduce(
      (sum, venta) => sum + venta.descuentoManual + venta.descuentoPromociones,
      0,
    )
    const totalRecargos = ventasFiltradas.reduce((sum, venta) => sum + venta.recargo, 0)
    const promedioVenta = totalVentas > 0 ? totalFacturado / totalVentas : 0

    // Comparar con período anterior
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

  // Análisis de productos
  const analisisProductos = useMemo(() => {
    const productosVendidos: {
      [nombre: string]: {
        cantidad: number
        ingresos: number
        ventas: number
        categoria: string
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      venta.items.forEach((item) => {
        const nombre = item.producto.nombre
        if (!productosVendidos[nombre]) {
          // Encontrar categoría del producto
          let categoria = "Sin categoría"
          Object.entries(productos).forEach(([catKey, cat]) => {
            if ((cat as any).productos.some((p: any) => p.id === item.producto.id)) {
              categoria = (cat as any).nombre
            }
          })

          productosVendidos[nombre] = {
            cantidad: 0,
            ingresos: 0,
            ventas: 0,
            categoria,
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
      porCategoria: productosArray.reduce(
        (acc, producto) => {
          if (!acc[producto.categoria]) {
            acc[producto.categoria] = { cantidad: 0, ingresos: 0 }
          }
          acc[producto.categoria].cantidad += producto.cantidad
          acc[producto.categoria].ingresos += producto.ingresos
          return acc
        },
        {} as { [categoria: string]: { cantidad: number; ingresos: number } },
      ),
    }
  }, [ventasFiltradas, productos])

  // Análisis temporal
  const analisisTemporal = useMemo(() => {
    const ventasPorDia: { [fecha: string]: { ventas: number; ingresos: number } } = {}
    const ventasPorHora: { [hora: number]: { ventas: number; ingresos: number } } = {}
    const ventasPorDiaSemana: { [dia: number]: { ventas: number; ingresos: number } } = {}

    // Inicializar horas
    for (let i = 0; i < 24; i++) {
      ventasPorHora[i] = { ventas: 0, ingresos: 0 }
    }

    // Inicializar días de la semana
    for (let i = 0; i < 7; i++) {
      ventasPorDiaSemana[i] = { ventas: 0, ingresos: 0 }
    }

    ventasFiltradas.forEach((venta) => {
      const fecha = new Date(venta.fecha)
      const fechaStr = fecha.toISOString().split("T")[0]
      const hora = fecha.getHours()
      const diaSemana = fecha.getDay()

      // Por día
      if (!ventasPorDia[fechaStr]) {
        ventasPorDia[fechaStr] = { ventas: 0, ingresos: 0 }
      }
      ventasPorDia[fechaStr].ventas += 1
      ventasPorDia[fechaStr].ingresos += venta.total

      // Por hora
      ventasPorHora[hora].ventas += 1
      ventasPorHora[hora].ingresos += venta.total

      // Por día de la semana
      ventasPorDiaSemana[diaSemana].ventas += 1
      ventasPorDiaSemana[diaSemana].ingresos += venta.total
    })

    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

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
    }
  }, [ventasFiltradas])

  // Análisis de promociones
  const analisisPromociones = useMemo(() => {
    const promocionesUsadas: {
      [nombre: string]: {
        usos: number
        descuentoTotal: number
        ventasAfectadas: number
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      if (venta.promocionesAplicadas.length > 0) {
        venta.promocionesAplicadas.forEach((promocion) => {
          if (!promocionesUsadas[promocion]) {
            promocionesUsadas[promocion] = {
              usos: 0,
              descuentoTotal: 0,
              ventasAfectadas: 0,
            }
          }
          promocionesUsadas[promocion].usos += 1
          promocionesUsadas[promocion].descuentoTotal += venta.descuentoPromociones
          promocionesUsadas[promocion].ventasAfectadas += 1
        })
      }
    })

    return Object.entries(promocionesUsadas)
      .map(([nombre, datos]) => ({
        nombre,
        ...datos,
        promedioDescuento: datos.descuentoTotal / datos.usos,
      }))
      .sort((a, b) => b.descuentoTotal - a.descuentoTotal)
  }, [ventasFiltradas])

  // Análisis de medios de pago
  const analisisMediosPago = useMemo(() => {
    const mediosPago: {
      [medio: string]: {
        ventas: number
        ingresos: number
        recargos: number
      }
    } = {}

    ventasFiltradas.forEach((venta) => {
      const medio = venta.nombreMedioPago
      if (!mediosPago[medio]) {
        mediosPago[medio] = { ventas: 0, ingresos: 0, recargos: 0 }
      }
      mediosPago[medio].ventas += 1
      mediosPago[medio].ingresos += venta.total
      mediosPago[medio].recargos += venta.recargo
    })

    return Object.entries(mediosPago)
      .map(([medio, datos]) => ({
        medio,
        ...datos,
        porcentaje: (datos.ventas / ventasFiltradas.length) * 100,
      }))
      .sort((a, b) => b.ventas - a.ventas)
  }, [ventasFiltradas])

  const formatearPeriodo = (periodo: string) => {
    const nombres = {
      "7d": "Últimos 7 días",
      "30d": "Últimos 30 días",
      "90d": "Últimos 90 días",
      todo: "Todo el tiempo",
    }
    return nombres[periodo as keyof typeof nombres]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              </SelectContent>
            </Select>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al POS
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas principales */}
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

          {/* Tab Productos */}
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
                            <p className="text-sm text-gray-500">{producto.categoria}</p>
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

          {/* Tab Temporal */}
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
            </div>
          </TabsContent>

          {/* Tab Promociones */}
          <TabsContent value="promociones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Rendimiento de Promociones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analisisPromociones.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se han aplicado promociones en este período</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analisisPromociones.map((promocion, index) => (
                      <div key={promocion.nombre} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              #{index + 1}
                            </Badge>
                            <h3 className="font-semibold">{promocion.nombre}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${promocion.descuentoTotal.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">descuento total</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{promocion.usos}</p>
                            <p className="text-sm text-gray-500">veces usada</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">{promocion.ventasAfectadas}</p>
                            <p className="text-sm text-gray-500">ventas afectadas</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-600">
                              ${promocion.promedioDescuento.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">descuento promedio</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Medios de Pago */}
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
                      ventas: {
                        label: "Ventas",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip />
                        <RechartsPieChart data={analisisMediosPago} cx="50%" cy="50%" outerRadius={80} dataKey="ventas">
                          {analisisMediosPago.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]} />
                          ))}
                        </RechartsPieChart>
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
                  <div className="space-y-4">
                    {analisisMediosPago.map((medio, index) => (
                      <div key={medio.medio} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORES_GRAFICO[index % COLORES_GRAFICO.length] }}
                            />
                            <h3 className="font-semibold">{medio.medio}</h3>
                          </div>
                          <Badge variant="outline">{medio.porcentaje.toFixed(1)}%</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-blue-600">{medio.ventas}</p>
                            <p className="text-xs text-gray-500">ventas</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">${medio.ingresos.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">ingresos</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-600">${medio.recargos.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">recargos</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Categorías */}
          <TabsContent value="categorias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Rendimiento por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analisisProductos.porCategoria).map(([categoria, datos]) => (
                    <div key={categoria} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">{categoria}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unidades vendidas:</span>
                          <span className="font-bold text-blue-600">{datos.cantidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingresos totales:</span>
                          <span className="font-bold text-green-600">${datos.ingresos.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Promedio por unidad:</span>
                          <span className="font-bold text-purple-600">
                            ${Math.round(datos.ingresos / datos.cantidad).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
