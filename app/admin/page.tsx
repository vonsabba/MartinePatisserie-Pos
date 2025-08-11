"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, Eye, EyeOff, User, Shield } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

interface Producto {
  id: number
  nombre: string
  precio: number
  imagen?: string
}

interface MedioPago {
  id: string
  nombre: string
  recargo: number
}

interface Descuento {
  id: number
  nombre: string
  porcentaje: number
}

interface Promocion {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
  fechaInicio: string
  fechaFin: string
  tipo: string
  configuracion?: any
}

interface Usuario {
  id: string
  nombre: string
  username: string
  password: string
  rol: "administrador" | "empleado"
  activo: boolean
}

function AdminContent() {
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
  } = useAppContext()

  // Estados para productos
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: 0, categoria: "", imagen: "" })
  const [editandoProducto, setEditandoProducto] = useState<{ categoria: string; id: number } | null>(null)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")

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
  const [mostrarPassword, setMostrarPassword] = useState<{ [key: string]: boolean }>({})

  // Funciones para productos
  const agregarProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precio <= 0) return

    const nuevosProductos = { ...productos }
    if (!nuevosProductos[nuevoProducto.categoria]) {
      nuevosProductos[nuevoProducto.categoria] = {
        nombre: nuevoProducto.categoria,
        orden: Object.keys(productos).length + 1,
        productos: [],
      }
    }

    const nuevoId = Math.max(...Object.values(productos).flatMap((cat) => cat.productos.map((p) => p.id))) + 1
    nuevosProductos[nuevoProducto.categoria].productos.push({
      id: nuevoId,
      nombre: nuevoProducto.nombre,
      precio: nuevoProducto.precio,
      imagen: nuevoProducto.imagen || undefined,
    })

    setProductos(nuevosProductos)
    setNuevoProducto({ nombre: "", precio: 0, categoria: "", imagen: "" })
  }

  const editarProducto = (categoria: string, id: number) => {
    const producto = productos[categoria].productos.find((p) => p.id === id)
    if (producto) {
      setNuevoProducto({
        nombre: producto.nombre,
        precio: producto.precio,
        categoria,
        imagen: producto.imagen || "",
      })
      setEditandoProducto({ categoria, id })
    }
  }

  const guardarEdicionProducto = () => {
    if (!editandoProducto || !nuevoProducto.nombre || nuevoProducto.precio <= 0) return

    const nuevosProductos = { ...productos }
    const productoIndex = nuevosProductos[editandoProducto.categoria].productos.findIndex(
      (p) => p.id === editandoProducto.id,
    )

    if (productoIndex !== -1) {
      nuevosProductos[editandoProducto.categoria].productos[productoIndex] = {
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

  const eliminarProducto = (categoria: string, id: number) => {
    const nuevosProductos = { ...productos }
    nuevosProductos[categoria].productos = nuevosProductos[categoria].productos.filter((p) => p.id !== id)
    setProductos(nuevosProductos)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setNuevoProducto((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Funciones para medios de pago
  const agregarMedioPago = () => {
    if (!nuevoMedioPago.nombre) return

    const nuevoId = `medio-${Date.now()}`
    setMediosPago([...mediosPago, { id: nuevoId, ...nuevoMedioPago }])
    setNuevoMedioPago({ nombre: "", recargo: 0 })
  }

  const editarMedioPago = (id: string) => {
    const medio = mediosPago.find((m) => m.id === id)
    if (medio) {
      setNuevoMedioPago({ nombre: medio.nombre, recargo: medio.recargo })
      setEditandoMedioPago(id)
    }
  }

  const guardarEdicionMedioPago = () => {
    if (!editandoMedioPago || !nuevoMedioPago.nombre) return

    setMediosPago(
      mediosPago.map((m) => (m.id === editandoMedioPago ? { id: editandoMedioPago, ...nuevoMedioPago } : m)),
    )
    setEditandoMedioPago(null)
    setNuevoMedioPago({ nombre: "", recargo: 0 })
  }

  const eliminarMedioPago = (id: string) => {
    setMediosPago(mediosPago.filter((m) => m.id !== id))
  }

  // Funciones para descuentos
  const agregarDescuento = () => {
    if (!nuevoDescuento.nombre || nuevoDescuento.porcentaje <= 0) return

    const nuevoId = Math.max(...descuentos.map((d) => d.id), 0) + 1
    setDescuentos([...descuentos, { id: nuevoId, ...nuevoDescuento }])
    setNuevoDescuento({ nombre: "", porcentaje: 0 })
  }

  const editarDescuento = (id: number) => {
    const descuento = descuentos.find((d) => d.id === id)
    if (descuento) {
      setNuevoDescuento({ nombre: descuento.nombre, porcentaje: descuento.porcentaje })
      setEditandoDescuento(id)
    }
  }

  const guardarEdicionDescuento = () => {
    if (!editandoDescuento || !nuevoDescuento.nombre || nuevoDescuento.porcentaje <= 0) return

    setDescuentos(
      descuentos.map((d) => (d.id === editandoDescuento ? { id: editandoDescuento, ...nuevoDescuento } : d)),
    )
    setEditandoDescuento(null)
    setNuevoDescuento({ nombre: "", porcentaje: 0 })
  }

  const eliminarDescuento = (id: number) => {
    setDescuentos(descuentos.filter((d) => d.id !== id))
  }

  // Funciones para promociones
  const agregarPromocion = () => {
    if (!nuevaPromocion.nombre || !nuevaPromocion.descripcion) return

    const nuevoId = Math.max(...promociones.map((p) => p.id), 0) + 1
    setPromociones([...promociones, { id: nuevoId, ...nuevaPromocion, configuracion: {} }])
    setNuevaPromocion({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "",
      activa: true,
    })
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
    if (!editandoPromocion || !nuevaPromocion.nombre) return

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

  const eliminarPromocion = (id: number) => {
    setPromociones(promociones.filter((p) => p.id !== id))
  }

  const togglePromocion = (id: number) => {
    setPromociones(promociones.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)))
  }

  // Funciones para usuarios
  const agregarUsuario = () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.username || !nuevoUsuario.password) return

    // Verificar que el username no exista
    if (usuarios.some((u) => u.username === nuevoUsuario.username)) {
      alert("El nombre de usuario ya existe")
      return
    }

    const nuevoId = `user-${Date.now()}`
    setUsuarios([...usuarios, { id: nuevoId, ...nuevoUsuario }])
    setNuevoUsuario({
      nombre: "",
      username: "",
      password: "",
      rol: "empleado",
      activo: true,
    })
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
    if (!editandoUsuario || !nuevoUsuario.nombre || !nuevoUsuario.username || !nuevoUsuario.password) return

    // Verificar que el username no exista en otros usuarios
    if (usuarios.some((u) => u.username === nuevoUsuario.username && u.id !== editandoUsuario)) {
      alert("El nombre de usuario ya existe")
      return
    }

    setUsuarios(usuarios.map((u) => (u.id === editandoUsuario ? { id: editandoUsuario, ...nuevoUsuario } : u)))
    setEditandoUsuario(null)
    setNuevoUsuario({
      nombre: "",
      username: "",
      password: "",
      rol: "empleado",
      activo: true,
    })
  }

  const eliminarUsuario = (id: string) => {
    // No permitir eliminar si es el único administrador
    const admins = usuarios.filter((u) => u.rol === "administrador" && u.activo)
    const usuarioAEliminar = usuarios.find((u) => u.id === id)

    if (usuarioAEliminar?.rol === "administrador" && admins.length === 1) {
      alert("No se puede eliminar el único administrador activo")
      return
    }

    setUsuarios(usuarios.filter((u) => u.id !== id))
  }

  const toggleUsuario = (id: string) => {
    // No permitir desactivar si es el único administrador
    const admins = usuarios.filter((u) => u.rol === "administrador" && u.activo)
    const usuario = usuarios.find((u) => u.id === id)

    if (usuario?.rol === "administrador" && usuario.activo && admins.length === 1) {
      alert("No se puede desactivar el único administrador activo")
      return
    }

    setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)))
  }

  const toggleMostrarPassword = (id: string) => {
    setMostrarPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="promociones">Promociones</TabsTrigger>
          <TabsTrigger value="medios-pago">Medios de Pago</TabsTrigger>
          <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        {/* Pestaña Productos */}
        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>Administra el catálogo de productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={nuevoProducto.precio}
                      onChange={(e) => setNuevoProducto((prev) => ({ ...prev, precio: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={nuevoProducto.categoria}
                      onValueChange={(value) => setNuevoProducto((prev) => ({ ...prev, categoria: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(productos).map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {productos[categoria].nombre}
                          </SelectItem>
                        ))}
                        <SelectItem value="nueva">Nueva categoría...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imagen">Imagen</Label>
                    <Input id="imagen" type="file" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                {nuevoProducto.imagen && (
                  <div className="flex items-center gap-4">
                    <img
                      src={nuevoProducto.imagen || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNuevoProducto((prev) => ({ ...prev, imagen: "" }))}
                    >
                      Quitar imagen
                    </Button>
                  </div>
                )}

                <Button onClick={editandoProducto ? guardarEdicionProducto : agregarProducto} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoProducto ? "Guardar cambios" : "Agregar producto"}
                </Button>

                {editandoProducto && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoProducto(null)
                      setNuevoProducto({ nombre: "", precio: 0, categoria: "", imagen: "" })
                    }}
                    className="w-fit"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="filtro-categoria">Filtrar por categoría</Label>
                  <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las categorías</SelectItem>
                      {Object.keys(productos).map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {productos[categoria].nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {Object.entries(productos)
                  .filter(
                    ([categoria]) =>
                      !categoriaSeleccionada ||
                      categoriaSeleccionada === "todas" ||
                      categoria === categoriaSeleccionada,
                  )
                  .map(([categoria, data]) => (
                    <Card key={categoria}>
                      <CardHeader>
                        <CardTitle className="text-lg">{data.nombre}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {data.productos.map((producto) => (
                            <div key={producto.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-3">
                                {producto.imagen && (
                                  <img
                                    src={producto.imagen || "/placeholder.svg"}
                                    alt={producto.nombre}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <span className="font-medium">{producto.nombre}</span>
                                  <span className="text-muted-foreground ml-2">${producto.precio}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editarProducto(categoria, producto.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => eliminarProducto(categoria, producto.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Promociones */}
        <TabsContent value="promociones">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Promociones</CardTitle>
              <CardDescription>Administra las promociones activas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="promo-nombre">Nombre</Label>
                    <Input
                      id="promo-nombre"
                      value={nuevaPromocion.nombre}
                      onChange={(e) => setNuevaPromocion((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre de la promoción"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promo-tipo">Tipo</Label>
                    <Select
                      value={nuevaPromocion.tipo}
                      onValueChange={(value) => setNuevaPromocion((prev) => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x1">2x1</SelectItem>
                        <SelectItem value="combo">Combo</SelectItem>
                        <SelectItem value="descuento-cantidad">Descuento por cantidad</SelectItem>
                        <SelectItem value="descuento-porcentaje">Descuento porcentaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="promo-descripcion">Descripción</Label>
                  <Textarea
                    id="promo-descripcion"
                    value={nuevaPromocion.descripcion}
                    onChange={(e) => setNuevaPromocion((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción de la promoción"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha-inicio">Fecha inicio</Label>
                    <Input
                      id="fecha-inicio"
                      type="date"
                      value={nuevaPromocion.fechaInicio}
                      onChange={(e) => setNuevaPromocion((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha-fin">Fecha fin</Label>
                    <Input
                      id="fecha-fin"
                      type="date"
                      value={nuevaPromocion.fechaFin}
                      onChange={(e) => setNuevaPromocion((prev) => ({ ...prev, fechaFin: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="promo-activa"
                    checked={nuevaPromocion.activa}
                    onCheckedChange={(checked) => setNuevaPromocion((prev) => ({ ...prev, activa: checked }))}
                  />
                  <Label htmlFor="promo-activa">Promoción activa</Label>
                </div>

                <Button onClick={editandoPromocion ? guardarEdicionPromocion : agregarPromocion} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoPromocion ? "Guardar cambios" : "Agregar promoción"}
                </Button>

                {editandoPromocion && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoPromocion(null)
                      setNuevaPromocion({
                        nombre: "",
                        descripcion: "",
                        fechaInicio: "",
                        fechaFin: "",
                        tipo: "",
                        activa: true,
                      })
                    }}
                    className="w-fit"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {promociones.map((promocion) => (
                  <Card key={promocion.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{promocion.nombre}</h3>
                            <Badge variant={promocion.activa ? "default" : "secondary"}>
                              {promocion.activa ? "Activa" : "Inactiva"}
                            </Badge>
                            <Badge variant="outline">{promocion.tipo}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{promocion.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            {promocion.fechaInicio} - {promocion.fechaFin}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => togglePromocion(promocion.id)}>
                            {promocion.activa ? "Desactivar" : "Activar"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => editarPromocion(promocion.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarPromocion(promocion.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Medios de Pago */}
        <TabsContent value="medios-pago">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Medios de Pago</CardTitle>
              <CardDescription>Administra los medios de pago disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medio-nombre">Nombre</Label>
                    <Input
                      id="medio-nombre"
                      value={nuevoMedioPago.nombre}
                      onChange={(e) => setNuevoMedioPago((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre del medio de pago"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medio-recargo">Recargo (%)</Label>
                    <Input
                      id="medio-recargo"
                      type="number"
                      value={nuevoMedioPago.recargo}
                      onChange={(e) => setNuevoMedioPago((prev) => ({ ...prev, recargo: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={editandoMedioPago ? guardarEdicionMedioPago : agregarMedioPago} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoMedioPago ? "Guardar cambios" : "Agregar medio de pago"}
                </Button>

                {editandoMedioPago && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoMedioPago(null)
                      setNuevoMedioPago({ nombre: "", recargo: 0 })
                    }}
                    className="w-fit"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {mediosPago.map((medio) => (
                  <div key={medio.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{medio.nombre}</span>
                      <span className="text-muted-foreground ml-2">
                        {medio.recargo > 0 ? `+${medio.recargo}%` : "Sin recargo"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editarMedioPago(medio.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => eliminarMedioPago(medio.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Descuentos */}
        <TabsContent value="descuentos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Descuentos</CardTitle>
              <CardDescription>Administra los descuentos disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descuento-nombre">Nombre</Label>
                    <Input
                      id="descuento-nombre"
                      value={nuevoDescuento.nombre}
                      onChange={(e) => setNuevoDescuento((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre del descuento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descuento-porcentaje">Porcentaje</Label>
                    <Input
                      id="descuento-porcentaje"
                      type="number"
                      value={nuevoDescuento.porcentaje}
                      onChange={(e) => setNuevoDescuento((prev) => ({ ...prev, porcentaje: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={editandoDescuento ? guardarEdicionDescuento : agregarDescuento} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoDescuento ? "Guardar cambios" : "Agregar descuento"}
                </Button>

                {editandoDescuento && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoDescuento(null)
                      setNuevoDescuento({ nombre: "", porcentaje: 0 })
                    }}
                    className="w-fit"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {descuentos.map((descuento) => (
                  <div key={descuento.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{descuento.nombre}</span>
                      <span className="text-muted-foreground ml-2">{descuento.porcentaje}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editarDescuento(descuento.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => eliminarDescuento(descuento.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Usuarios */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usuario-nombre">Nombre completo</Label>
                    <Input
                      id="usuario-nombre"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usuario-username">Nombre de usuario</Label>
                    <Input
                      id="usuario-username"
                      value={nuevoUsuario.username}
                      onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Nombre de usuario"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usuario-password">Contraseña</Label>
                    <Input
                      id="usuario-password"
                      type="password"
                      value={nuevoUsuario.password}
                      onChange={(e) => setNuevoUsuario((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Contraseña"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usuario-rol">Rol</Label>
                    <Select
                      value={nuevoUsuario.rol}
                      onValueChange={(value: "administrador" | "empleado") =>
                        setNuevoUsuario((prev) => ({ ...prev, rol: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="usuario-activo"
                    checked={nuevoUsuario.activo}
                    onCheckedChange={(checked) => setNuevoUsuario((prev) => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="usuario-activo">Usuario activo</Label>
                </div>

                <Button onClick={editandoUsuario ? guardarEdicionUsuario : agregarUsuario} className="w-fit">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoUsuario ? "Guardar cambios" : "Agregar usuario"}
                </Button>

                {editandoUsuario && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoUsuario(null)
                      setNuevoUsuario({
                        nombre: "",
                        username: "",
                        password: "",
                        rol: "empleado",
                        activo: true,
                      })
                    }}
                    className="w-fit"
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {usuario.rol === "administrador" ? (
                          <Shield className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{usuario.nombre}</span>
                            <Badge variant={usuario.activo ? "default" : "secondary"}>
                              {usuario.activo ? "Activo" : "Inactivo"}
                            </Badge>
                            <Badge variant="outline">{usuario.rol}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>@{usuario.username}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span>{mostrarPassword[usuario.id] ? usuario.password : "••••••••"}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMostrarPassword(usuario.id)}
                                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                              >
                                {mostrarPassword[usuario.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleUsuario(usuario.id)}>
                        {usuario.activo ? "Desactivar" : "Activar"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => editarUsuario(usuario.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => eliminarUsuario(usuario.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <AdminContent />
    </ProtectedRoute>
  )
}
