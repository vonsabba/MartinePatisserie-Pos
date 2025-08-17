"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Save, X, Plus, Trash2, Check, ChevronsUpDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Producto {
  id: number
  nombre: string
  precio: number
}

interface ProductoCombo {
  id?: number
  categoriaId?: string
  cantidad: number
  filtro?: string
  nombre?: string
}

interface ConfiguracionPromocion {
  // Para 2x1
  categorias?: string[]

  // Para combo
  productos?: ProductoCombo[]
  precioCombo?: number

  // Para descuento por cantidad
  categoria?: string
  cantidadMinima?: number
  porcentaje?: number

  // Nueva propiedad para acumulabilidad
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

interface ModalPromocionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promocion: Promocion | null
  onGuardar: (promocion: Omit<Promocion, "id">) => void
  productos: any
}

export default function ModalPromocionAvanzado({
  open,
  onOpenChange,
  promocion,
  onGuardar,
  productos,
}: ModalPromocionProps) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activa: true,
    fechaInicio: "",
    fechaFin: "",
    tipo: "",
    configuracion: {} as ConfiguracionPromocion,
  })

  const [openProductoSelect, setOpenProductoSelect] = useState<number | null>(null)
  const [errores, setErrores] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (promocion) {
      setForm({
        nombre: promocion.nombre,
        descripcion: promocion.descripcion,
        activa: promocion.activa,
        fechaInicio: promocion.fechaInicio,
        fechaFin: promocion.fechaFin,
        tipo: promocion.tipo,
        configuracion: promocion.configuracion || {},
      })
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        activa: true,
        fechaInicio: "",
        fechaFin: "",
        tipo: "",
        configuracion: {},
      })
    }
  }, [promocion])

  const handleGuardar = () => {
    const nuevosErrores: { [key: string]: boolean } = {}

    // Validar campos obligatorios
    if (!form.nombre) nuevosErrores.nombre = true
    if (!form.descripcion) nuevosErrores.descripcion = true
    if (!form.fechaInicio) nuevosErrores.fechaInicio = true
    if (!form.fechaFin) nuevosErrores.fechaFin = true
    if (!form.tipo) nuevosErrores.tipo = true

    // Validaciones específicas por tipo
    if (form.tipo === "combo") {
      if (!form.configuracion.productos || form.configuracion.productos.length === 0) {
        nuevosErrores.productos = true
      }
      if (!form.configuracion.precioCombo) nuevosErrores.precioCombo = true
    }

    if (form.tipo === "descuento-cantidad") {
      if (!form.configuracion.productos || form.configuracion.productos.length === 0) {
        nuevosErrores.productos = true
      }
      if (!form.configuracion.cantidadMinima) nuevosErrores.cantidadMinima = true
      if (!form.configuracion.porcentaje) nuevosErrores.porcentaje = true
    }

    if (form.tipo === "2x1") {
      if (!form.configuracion.productos || form.configuracion.productos.length === 0) {
        nuevosErrores.productos = true
      }
    }

    if (form.tipo === "descuento-general") {
      if (!form.configuracion.porcentaje) nuevosErrores.porcentaje = true
    }

    setErrores(nuevosErrores)

    // Si hay errores, no continuar
    if (Object.keys(nuevosErrores).length > 0) {
      return
    }

    console.log("Guardando promoción:", form) // Para debug

    onGuardar(form)
    onOpenChange(false)
  }

  const actualizarConfiguracion = (nuevaConfig: Partial<ConfiguracionPromocion>) => {
    setForm((prev) => ({
      ...prev,
      configuracion: { ...prev.configuracion, ...nuevaConfig },
    }))
  }

  const agregarProductoCombo = () => {
    const productosActuales = form.configuracion.productos || []
    actualizarConfiguracion({
      productos: [...productosActuales, { cantidad: 1 }],
    })
  }

  const eliminarProductoCombo = (index: number) => {
    const productosActuales = form.configuracion.productos || []
    actualizarConfiguracion({
      productos: productosActuales.filter((_, i) => i !== index),
    })
  }

  const actualizarProductoCombo = (index: number, producto: Partial<ProductoCombo>) => {
    const productosActuales = form.configuracion.productos || []
    const nuevosProductos = [...productosActuales]
    nuevosProductos[index] = { ...nuevosProductos[index], ...producto }
    actualizarConfiguracion({ productos: nuevosProductos })
  }

  const obtenerTodosLosProductos = () => {
    const todosLosProductos: (Producto & { categoria: string; categoriaKey: string })[] = []

    Object.entries(productos).forEach(([catKey, categoria]) => {
      ;(categoria as any).productos.forEach((prod: Producto) => {
        todosLosProductos.push({
          ...prod,
          categoria: (categoria as any).nombre,
          categoriaKey: catKey,
        })
      })
    })

    return todosLosProductos
  }

  const obtenerNombreProducto = (id: number) => {
    for (const categoria of Object.values(productos)) {
      const producto = (categoria as any).productos.find((p: Producto) => p.id === id)
      if (producto) return producto.nombre
    }
    return "Producto no encontrado"
  }

  const renderSelectProductoConBusqueda = (index: number, producto: ProductoCombo) => {
    const todosLosProductos = obtenerTodosLosProductos()
    const productoSeleccionado = todosLosProductos.find((p) => p.id === producto.id)

    return (
      <div className="flex-1">
        <Label>Producto específico</Label>
        <Popover
          open={openProductoSelect === index}
          onOpenChange={(open) => setOpenProductoSelect(open ? index : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openProductoSelect === index}
              className="w-full justify-between bg-transparent"
            >
              {productoSeleccionado ? (
                <div className="flex flex-col items-start">
                  <span>{productoSeleccionado.nombre}</span>
                  <span className="text-xs text-gray-500">
                    {productoSeleccionado.categoria} - ${productoSeleccionado.precio}
                  </span>
                </div>
              ) : (
                "Seleccionar producto..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar producto..." />
              <CommandList>
                <CommandEmpty>No se encontraron productos.</CommandEmpty>
                <CommandGroup>
                  {todosLosProductos.map((prod) => (
                    <CommandItem
                      key={prod.id}
                      value={`${prod.nombre} ${prod.categoria}`}
                      onSelect={() => {
                        actualizarProductoCombo(index, { id: prod.id })
                        setOpenProductoSelect(null)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", producto.id === prod.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span>{prod.nombre}</span>
                        <span className="text-xs text-gray-500">
                          {prod.categoria} - ${prod.precio}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  const limpiarError = (campo: string) => {
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevosErrores = { ...prev }
        delete nuevosErrores[campo]
        return nuevosErrores
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-4xl w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{promocion ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-sm sm:text-base">
                Nombre de la promoción
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, nombre: e.target.value }))
                  limpiarError("nombre")
                }}
                placeholder="Ej: 2x1 en Cookies"
                className={cn("text-sm sm:text-base", errores.nombre ? "border-red-500 focus:border-red-500" : "")}
              />
            </div>
            <div>
              <Label htmlFor="tipo" className="text-sm sm:text-base">
                Tipo de promoción
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, tipo: value, configuracion: {} }))
                  limpiarError("tipo")
                }}
              >
                <SelectTrigger
                  className={cn("text-sm sm:text-base", errores.tipo ? "border-red-500 focus:border-red-500" : "")}
                >
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2x1">2x1</SelectItem>
                  <SelectItem value="combo">Combos</SelectItem>
                  <SelectItem value="descuento-cantidad">Descuento por Cantidad</SelectItem>
                  <SelectItem value="descuento-general">Descuento General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-sm sm:text-base">
              Descripción
            </Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
                limpiarError("descripcion")
              }}
              placeholder="Descripción detallada de la promoción"
              className={cn("text-sm sm:text-base", errores.descripcion ? "border-red-500 focus:border-red-500" : "")}
            />
          </div>

          {form.tipo === "2x1" && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Configuración 2x1</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Producto</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-sm">Tipo de producto</Label>
                      <Select
                        value={producto.id !== undefined ? "producto" : "categoria"}
                        onValueChange={(value) => {
                          if (value === "producto") {
                            actualizarProductoCombo(index, { id: 0, categoriaId: undefined })
                          } else {
                            actualizarProductoCombo(index, { id: undefined, categoriaId: "" })
                          }
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="producto">Producto específico</SelectItem>
                          <SelectItem value="categoria">Cualquiera de una categoría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {producto.id !== undefined ? (
                      renderSelectProductoConBusqueda(index, producto)
                    ) : (
                      <div className="flex-1">
                        <Label className="text-sm">Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(productos).map(([key, categoria]) => (
                              <SelectItem key={key} value={key}>
                                {(categoria as any).nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarProductoCombo(index)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden ml-2">Eliminar</span>
                    </Button>
                  </div>
                ))}
                {errores.productos && (
                  <div className="text-red-500 text-sm mt-1">
                    Debes agregar al menos un producto para esta promoción
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">¿Cómo funciona el 2x1?</p>
                      <p className="text-xs sm:text-sm">
                        Se cobrará el producto más caro y se descontará el más barato por cada par de productos que
                        coincidan.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo === "combo" && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Configuración de Combos</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Producto</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-sm">Tipo de producto</Label>
                      <Select
                        value={producto.id !== undefined ? "producto" : "categoria"}
                        onValueChange={(value) => {
                          if (value === "producto") {
                            actualizarProductoCombo(index, { id: 0, categoriaId: undefined })
                          } else {
                            actualizarProductoCombo(index, { id: undefined, categoriaId: "" })
                          }
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="producto">Producto específico</SelectItem>
                          <SelectItem value="categoria">Cualquiera de una categoría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {producto.id !== undefined ? (
                      renderSelectProductoConBusqueda(index, producto)
                    ) : (
                      <div className="flex-1">
                        <Label className="text-sm">Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(productos).map(([key, categoria]) => (
                              <SelectItem key={key} value={key}>
                                {(categoria as any).nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="w-full sm:w-20">
                      <Label className="text-sm">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidad}
                        onChange={(e) =>
                          actualizarProductoCombo(index, { cantidad: Number.parseInt(e.target.value) || 1 })
                        }
                        className="text-sm"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarProductoCombo(index)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden ml-2">Eliminar</span>
                    </Button>
                  </div>
                ))}
                {errores.productos && (
                  <div className="text-red-500 text-sm mt-1">
                    Debes agregar al menos un producto para esta promoción
                  </div>
                )}

                <div className="mt-4">
                  <Label htmlFor="precio-combo" className="text-sm sm:text-base">
                    Precio del combo
                  </Label>
                  <Input
                    id="precio-combo"
                    type="number"
                    value={form.configuracion.precioCombo || ""}
                    onChange={(e) => {
                      actualizarConfiguracion({ precioCombo: Number.parseFloat(e.target.value) || 0 })
                      limpiarError("precioCombo")
                    }}
                    placeholder="Precio especial del combo"
                    className={cn(
                      "text-sm sm:text-base",
                      errores.precioCombo ? "border-red-500 focus:border-red-500" : "",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo === "descuento-cantidad" && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Descuento por Cantidad</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Producto</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-sm">Tipo de producto</Label>
                      <Select
                        value={producto.id !== undefined ? "producto" : "categoria"}
                        onValueChange={(value) => {
                          if (value === "producto") {
                            actualizarProductoCombo(index, { id: 0, categoriaId: undefined })
                          } else {
                            actualizarProductoCombo(index, { id: undefined, categoriaId: "" })
                          }
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="producto">Producto específico</SelectItem>
                          <SelectItem value="categoria">Cualquiera de una categoría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {producto.id !== undefined ? (
                      renderSelectProductoConBusqueda(index, producto)
                    ) : (
                      <div className="flex-1">
                        <Label className="text-sm">Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(productos).map(([key, categoria]) => (
                              <SelectItem key={key} value={key}>
                                {(categoria as any).nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarProductoCombo(index)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden ml-2">Eliminar</span>
                    </Button>
                  </div>
                ))}
                {errores.productos && (
                  <div className="text-red-500 text-sm mt-1">
                    Debes agregar al menos un producto para esta promoción
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-sm sm:text-base">Cantidad mínima</Label>
                    <Input
                      type="number"
                      min="2"
                      value={form.configuracion.cantidadMinima || ""}
                      onChange={(e) => {
                        actualizarConfiguracion({ cantidadMinima: Number.parseInt(e.target.value) || 2 })
                        limpiarError("cantidadMinima")
                      }}
                      placeholder="Ej: 3"
                      className={cn(
                        "text-sm sm:text-base",
                        errores.cantidadMinima ? "border-red-500 focus:border-red-500" : "",
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Porcentaje de descuento</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={form.configuracion.porcentaje || ""}
                      onChange={(e) => {
                        actualizarConfiguracion({ porcentaje: Number.parseFloat(e.target.value) || 0 })
                        limpiarError("porcentaje")
                      }}
                      placeholder="Ej: 10"
                      className={cn(
                        "text-sm sm:text-base",
                        errores.porcentaje ? "border-red-500 focus:border-red-500" : "",
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo === "descuento-general" && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Descuento General</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <Label className="text-sm sm:text-base">Porcentaje de descuento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={form.configuracion.porcentaje || ""}
                    onChange={(e) => {
                      actualizarConfiguracion({ porcentaje: Number.parseFloat(e.target.value) || 0 })
                      limpiarError("porcentaje")
                    }}
                    placeholder="Ej: 15"
                    className={cn(
                      "text-sm sm:text-base",
                      errores.porcentaje ? "border-red-500 focus:border-red-500" : "",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha-inicio" className="text-sm sm:text-base">
                Fecha de inicio
              </Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={form.fechaInicio}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))
                  limpiarError("fechaInicio")
                }}
                className={cn("text-sm sm:text-base", errores.fechaInicio ? "border-red-500 focus:border-red-500" : "")}
              />
            </div>
            <div>
              <Label htmlFor="fecha-fin" className="text-sm sm:text-base">
                Fecha de fin
              </Label>
              <Input
                id="fecha-fin"
                type="date"
                value={form.fechaFin}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, fechaFin: e.target.value }))
                  limpiarError("fechaFin")
                }}
                className={cn("text-sm sm:text-base", errores.fechaFin ? "border-red-500 focus:border-red-500" : "")}
              />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Opciones Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activa"
                  checked={form.activa}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, activa: !!checked }))}
                />
                <Label htmlFor="activa" className="text-sm sm:text-base">
                  Promoción activa
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acumulable"
                  checked={form.configuracion.acumulable || false}
                  onCheckedChange={(checked) => actualizarConfiguracion({ acumulable: !!checked })}
                />
                <Label htmlFor="acumulable" className="text-sm sm:text-base">
                  Acumulable con otras promociones
                </Label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-amber-800">
                    <p className="font-medium">Promociones Acumulables</p>
                    <p>
                      Si está marcado, esta promoción se puede combinar con otras promociones acumulables. Si no está
                      marcado, solo se aplicará la promoción con mayor descuento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleGuardar} className="flex-1 text-sm sm:text-base">
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Guardar Promoción</span>
              <span className="sm:hidden">Guardar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial text-sm sm:text-base"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
