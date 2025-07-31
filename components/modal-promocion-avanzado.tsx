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
    if (!form.nombre || !form.descripcion || !form.fechaInicio || !form.fechaFin || !form.tipo) return

    // Validar que la configuración esté completa según el tipo
    if (form.tipo === "combo" && (!form.configuracion.productos || !form.configuracion.precioCombo)) {
      alert("Por favor completa todos los campos del combo")
      return
    }

    if (
      form.tipo === "descuento-cantidad" &&
      (!form.configuracion.productos || !form.configuracion.cantidadMinima || !form.configuracion.porcentaje)
    ) {
      alert("Por favor completa todos los campos del descuento por cantidad")
      return
    }

    if (form.tipo === "2x1" && (!form.configuracion.productos || form.configuracion.productos.length === 0)) {
      alert("Por favor agrega al menos un producto para el 2x1")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promocion ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la promoción</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: 2x1 en Cookies"
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de promoción</Label>
              <Select
                value={form.tipo}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, tipo: value, configuracion: {} }))
                }}
              >
                <SelectTrigger>
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
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción detallada de la promoción"
            />
          </div>

          {/* Configuración específica según el tipo */}
          {form.tipo === "2x1" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Configuración 2x1</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label>Tipo de producto</Label>
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
                        <SelectTrigger>
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
                        <Label>Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger>
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

                    <Button size="sm" variant="ghost" onClick={() => eliminarProductoCombo(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">¿Cómo funciona el 2x1?</p>
                      <p>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Configuración de Combos</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label>Tipo de producto</Label>
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
                        <SelectTrigger>
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
                        <Label>Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger>
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

                    <div className="w-20">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidad}
                        onChange={(e) =>
                          actualizarProductoCombo(index, { cantidad: Number.parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => eliminarProductoCombo(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="mt-4">
                  <Label htmlFor="precio-combo">Precio del combo</Label>
                  <Input
                    id="precio-combo"
                    type="number"
                    value={form.configuracion.precioCombo || ""}
                    onChange={(e) => actualizarConfiguracion({ precioCombo: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Precio especial del combo"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo === "descuento-cantidad" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Descuento por Cantidad</CardTitle>
                <Button size="sm" onClick={agregarProductoCombo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(form.configuracion.productos || []).map((producto, index) => (
                  <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label>Tipo de producto</Label>
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
                        <SelectTrigger>
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
                        <Label>Categoría</Label>
                        <Select
                          value={producto.categoriaId || ""}
                          onValueChange={(value) => actualizarProductoCombo(index, { categoriaId: value })}
                        >
                          <SelectTrigger>
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

                    <Button size="sm" variant="ghost" onClick={() => eliminarProductoCombo(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Cantidad mínima</Label>
                    <Input
                      type="number"
                      min="2"
                      value={form.configuracion.cantidadMinima || ""}
                      onChange={(e) =>
                        actualizarConfiguracion({ cantidadMinima: Number.parseInt(e.target.value) || 2 })
                      }
                      placeholder="Ej: 3"
                    />
                  </div>
                  <div>
                    <Label>Porcentaje de descuento</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={form.configuracion.porcentaje || ""}
                      onChange={(e) => actualizarConfiguracion({ porcentaje: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo === "descuento-general" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descuento General</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Porcentaje de descuento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={form.configuracion.porcentaje || ""}
                    onChange={(e) => actualizarConfiguracion({ porcentaje: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 15"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fechas y estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha-inicio">Fecha de inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fecha-fin">Fecha de fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opciones Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activa"
                  checked={form.activa}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, activa: !!checked }))}
                />
                <Label htmlFor="activa">Promoción activa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acumulable"
                  checked={form.configuracion.acumulable || false}
                  onCheckedChange={(checked) => actualizarConfiguracion({ acumulable: !!checked })}
                />
                <Label htmlFor="acumulable">Acumulable con otras promociones</Label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
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

          {/* Botones */}
          <div className="flex gap-2">
            <Button onClick={handleGuardar} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar Promoción
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
