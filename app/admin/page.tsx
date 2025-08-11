"use client"
import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Eye, EyeOff, ArrowLeft, Search, SortAsc } from "lucide-react"

export default function AdminPage() {
  const {
    productos,
    setProductos,
    promociones,
    setPromociones,
    mediosPago,
    setMediosPago,
    descuentos,
    setDescuentos,
    usuarios,
    setUsuarios,
    usuarioActual,
    isAdmin,
  } = useAppContext()

  // Estados para productos
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: 0, categoria: "", imagen: "" })
  const [editandoProducto, setEditandoProducto] = useState<{ categoria: string; id: number } | null>(null)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas")
  const [busquedaProducto, setBusquedaProducto] = useState("")

  // Estados para medios de pago
  const [nuevoMedioPago, setNuevoMedioPago] = useState({ nombre: "", recargo: 0 })
  const [editandoMedioPago, setEditandoMedioPago] = useState<string | null>(null)

  // Estados para descuentos
  const [nuevoDescuento, setNuevoDescuento] = useState({ nombre: "", porcentaje: 0 })
  const [editandoDescuento, setEditandoDescuento] = useState<number | null>(null)

  // Estados para promociones
  const [nuevaPromocion, setNuevaPromocion] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    tipo: "",
    activa: true,
  })
  const [editandoPromocion, setEditandoPromocion] = useState<number | null>(null)

  // Estados para usuarios
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    username: "",
    password: "",
    rol: "empleado" as "administrador" | "empleado",
    activo: true,
  })
  const [editandoUsuario, setEditandoUsuario] = useState<string | null>(null)

  const [accessDenied, setAccessDenied] = useState(false)

  if (!usuarioActual || !isAdmin) {
    setAccessDenied(true)
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">Solo los administradores pueden acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const agregarProducto = () => {
    if (nuevoProducto.nombre && nuevoProducto.precio > 0 && nuevoProducto.categoria) {
      const nuevosProductos = { ...productos }
      if (!nuevosProductos[nuevoProducto.categoria]) {
        nuevosProductos[nuevoProducto.categoria] = { nombre: nuevoProducto.categoria, productos: [] }
      }
      const nuevoId =
        Math.max(
          ...Object.values(productos)
            .flatMap((cat) => cat.productos)
            .map((p) => p.id),
          0,
        ) + 1
      nuevosProductos[nuevoProducto.categoria].productos.push({
        id: nuevoId,
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        imagen: nuevoProducto.imagen || undefined,
      })
      setProductos(nuevosProductos)
      setNuevoProducto({ nombre: "", precio: 0, categoria: "", imagen: "" })
    }
  }

  const eliminarProducto = (categoria: string, id: number) => {
    const nuevosProductos = { ...productos }
    nuevosProductos[categoria].productos = nuevosProductos[categoria].productos.filter((p) => p.id !== id)
    setProductos(nuevosProductos)
  }

  const editarProducto = (categoria: string, id: number) => {
    const producto = productos[categoria].productos.find((p) => p.id === id)
    if (producto) {
      setNuevoProducto({
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: categoria,
        imagen: producto.imagen || "",
      })
      setEditandoProducto({ categoria, id })
    }
  }

  const guardarEdicionProducto = () => {
    if (editandoProducto && nuevoProducto.nombre && nuevoProducto.precio > 0) {
      const nuevosProductos = { ...productos }
      const index = nuevosProductos[editandoProducto.categoria].productos.findIndex((p) => p.id === editandoProducto.id)
      if (index !== -1) {
        nuevosProductos[editandoProducto.categoria].productos[index] = {
          id: editandoProducto.id,
          nombre: nuevoProducto.nombre,
          precio: nuevoProducto.precio,
          imagen: nuevoProducto.imagen || undefined,
        }
        setProductos(nuevosProductos)
      }
      setEditandoProducto(null)
      setNuevoProducto({ nombre: "", precio: 0, categoria: "", imagen: "" })
    }
  }

  const agregarMedioPago = () => {
    if (nuevoMedioPago.nombre) {
      const nuevoId = `medio_${Date.now()}`
      setMediosPago([...mediosPago, { id: nuevoId, ...nuevoMedioPago }])
      setNuevoMedioPago({ nombre: "", recargo: 0 })
    }
  }

  const eliminarMedioPago = (id: string) => {
    setMediosPago(mediosPago.filter((m) => m.id !== id))
  }

  const editarMedioPago = (id: string) => {
    const medio = mediosPago.find((m) => m.id === id)
    if (medio) {
      setNuevoMedioPago({ nombre: medio.nombre, recargo: medio.recargo })
      setEditandoMedioPago(id)
    }
  }

  const guardarEdicionMedioPago = () => {
    if (editandoMedioPago && nuevoMedioPago.nombre) {
      setMediosPago(
        mediosPago.map((m) =>
          m.id === editandoMedioPago ? { ...m, nombre: nuevoMedioPago.nombre, recargo: nuevoMedioPago.recargo } : m,
        ),
      )
      setEditandoMedioPago(null)
      setNuevoMedioPago({ nombre: "", recargo: 0 })
    }
  }

  const agregarDescuento = () => {
    if (nuevoDescuento.nombre && nuevoDescuento.porcentaje > 0) {
      const nuevoId = Math.max(...descuentos.map((d) => d.id), 0) + 1
      setDescuentos([...descuentos, { id: nuevoId, ...nuevoDescuento }])
      setNuevoDescuento({ nombre: "", porcentaje: 0 })
    }
  }

  const eliminarDescuento = (id: number) => {
    setDescuentos(descuentos.filter((d) => d.id !== id))
  }

  const editarDescuento = (id: number) => {
    const descuento = descuentos.find((d) => d.id === id)
    if (descuento) {
      setNuevoDescuento({ nombre: descuento.nombre, porcentaje: descuento.porcentaje })
      setEditandoDescuento(id)
    }
  }

  const guardarEdicionDescuento = () => {
    if (editandoDescuento && nuevoDescuento.nombre && nuevoDescuento.porcentaje > 0) {
      setDescuentos(
        descuentos.map((d) =>
          d.id === editandoDescuento
            ? { ...d, nombre: nuevoDescuento.nombre, porcentaje: nuevoDescuento.porcentaje }
            : d,
        ),
      )
      setEditandoDescuento(null)
      setNuevoDescuento({ nombre: "", porcentaje: 0 })
    }
  }

  const agregarPromocion = () => {
    if (nuevaPromocion.nombre && nuevaPromocion.descripcion) {
      const nuevoId = Math.max(...promociones.map((p) => p.id), 0) + 1
      setPromociones([...promociones, { id: nuevoId, ...nuevaPromocion }])
      setNuevaPromocion({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        tipo: "",
        activa: true,
      })
    }
  }

  const eliminarPromocion = (id: number) => {
    setPromociones(promociones.filter((p) => p.id !== id))
  }

  const togglePromocion = (id: number) => {
    setPromociones(promociones.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)))
  }

  const editarPromocion = (id: number) => {
    const promocion = promociones.find((p) => p.id === id)
    if (promocion) {
      setNuevaPromocion({
        nombre: promocion.nombre,
        descripcion: promocion.descripcion,
        fechaInicio: promocion.fechaInicio,
        fechaFin: promocion.fechaFin,
        tipo: promocion.tipo,
        activa: promocion.activa,
      })
      setEditandoPromocion(id)
    }
  }

  const guardarEdicionPromocion = () => {
    if (editandoPromocion && nuevaPromocion.nombre && nuevaPromocion.descripcion) {
      setPromociones(promociones.map((p) => (p.id === editandoPromocion ? { ...p, ...nuevaPromocion } : p)))
      setEditandoPromocion(null)
      setNuevaPromocion({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        tipo: "",
        activa: true,
      })
    }
  }

  const agregarUsuario = () => {
    if (nuevoUsuario.nombre && nuevoUsuario.username && nuevoUsuario.password) {
      const nuevoId = `user_${Date.now()}`
      setUsuarios([...usuarios, { id: nuevoId, ...nuevoUsuario }])
      setNuevoUsuario({
        nombre: "",
        username: "",
        password: "",
        rol: "empleado",
        activo: true,
      })
    }
  }

  const eliminarUsuario = (id: string) => {
    setUsuarios(usuarios.filter((u) => u.id !== id))
  }

  const toggleUsuario = (id: string) => {
    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)))
  }

  const editarUsuario = (id: string) => {
    const usuario = usuarios.find((u) => u.id === id)
    if (usuario) {
      setNuevoUsuario({
        nombre: usuario.nombre,
        username: usuario.username,
        password: usuario.password,
        rol: usuario.rol,
        activo: usuario.activo,
      })
      setEditandoUsuario(id)
    }
  }

  const guardarEdicionUsuario = () => {
    if (editandoUsuario && nuevoUsuario.nombre && nuevoUsuario.username && nuevoUsuario.password) {
      setUsuarios(usuarios.map((u) => (u.id === editandoUsuario ? { ...u, ...nuevoUsuario } : u)))
      setEditandoUsuario(null)
      setNuevoUsuario({
        nombre: "",
        username: "",
        password: "",
        rol: "empleado",
        activo: true,
      })
    }
  }

  const productosFiltrados = Object.entries(productos).reduce(
    (acc, [categoria, categoriaData]) => {
      if (categoriaSeleccionada === "todas" || categoriaSeleccionada === categoria) {
        const prodsFiltrados = categoriaData.productos.filter((p) =>
          p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()),
        )
        if (prodsFiltrados.length > 0) {
          acc[categoria] = {
            ...categoriaData,
            productos: prodsFiltrados,
          }
        }
      }
      return acc
    },
    {} as typeof productos,
  )

  const totalProductos = Object.values(productosFiltrados).reduce(
    (total, categoriaData) => total + categoriaData.productos.length,
    0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-amber-600">Martine Pâtisserie</h1>
              <span className="text-lg text-gray-600">Panel de Administración</span>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al POS
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="productos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="medios-pago">Medios de Pago</TabsTrigger>
            <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
            <TabsTrigger value="promociones">Promociones</TabsTrigger>
          </TabsList>

          <TabsContent value="productos">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Gestión de Productos</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Categorías
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Producto
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar productos..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <SortAsc className="w-4 h-4 mr-2" />
                      A-Z
                    </Button>
                    <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Categorías (4/4)</SelectItem>
                        {Object.keys(productos).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {Object.entries(productosFiltrados).map(([categoria, categoriaData]) => (
                  <div key={categoria} className="mb-8">
                    <h3 className="text-lg font-medium text-blue-600 mb-4">
                      {categoriaData.nombre} ({categoriaData.productos.length} productos)
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {categoriaData.productos.map((producto) => (
                        <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{producto.nombre}</h4>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => editarProducto(categoria, producto.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarProducto(categoria, producto.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-green-600 font-semibold">${producto.precio}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medios-pago">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Medios de Pago</h2>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Medio de Pago
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Buscar medios de pago..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <SortAsc className="w-4 h-4 mr-2" />
                    A-Z
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  {mediosPago.map((medio) => (
                    <div key={medio.id} className="border rounded-lg p-6 text-center">
                      <div className="flex justify-end mb-2">
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => editarMedioPago(medio.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => eliminarMedioPago(medio.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{medio.nombre}</h3>
                      <p className="text-sm text-gray-600">Recargo: {medio.recargo}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="descuentos">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Descuentos Disponibles</h2>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Descuento
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Buscar descuentos..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <SortAsc className="w-4 h-4 mr-2" />
                    A-Z
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  {descuentos.map((descuento) => (
                    <div key={descuento.id} className="border rounded-lg p-6 text-center">
                      <div className="flex justify-end mb-2">
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => editarDescuento(descuento.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => eliminarDescuento(descuento.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{descuento.nombre}</h3>
                      <p className="text-sm text-gray-600">Descuento: {descuento.porcentaje}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="promociones">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Promociones</h2>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Promoción
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Buscar promociones..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <SortAsc className="w-4 h-4 mr-2" />
                    A-Z
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {/* Promociones Activas */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-green-600 mb-4">
                    Promociones Activas ({promociones.filter((p) => p.activa).length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {promociones
                      .filter((p) => p.activa)
                      .map((promocion) => (
                        <div key={promocion.id} className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">{promocion.nombre}</h4>
                              <p className="text-sm text-gray-600 mb-2">{promocion.descripcion}</p>
                              <div className="text-xs text-gray-500">
                                <p>
                                  Desde: {promocion.fechaInicio} Hasta: {promocion.fechaFin}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button variant="ghost" size="sm" onClick={() => editarPromocion(promocion.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => togglePromocion(promocion.id)}>
                                <EyeOff className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => eliminarPromocion(promocion.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Activa
                            </Badge>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{promocion.tipo}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Promociones Inactivas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">
                    Promociones Inactivas ({promociones.filter((p) => !p.activa).length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {promociones
                      .filter((p) => !p.activa)
                      .map((promocion) => (
                        <div key={promocion.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-700">{promocion.nombre}</h4>
                              <p className="text-sm text-gray-500 mb-2">{promocion.descripcion}</p>
                              <div className="text-xs text-gray-400">
                                <p>
                                  Desde: {promocion.fechaInicio} Hasta: {promocion.fechaFin}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button variant="ghost" size="sm" onClick={() => editarPromocion(promocion.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => togglePromocion(promocion.id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => eliminarPromocion(promocion.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-gray-600">
                              Inactiva
                            </Badge>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{promocion.tipo}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
