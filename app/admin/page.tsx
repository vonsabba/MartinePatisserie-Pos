"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, ArrowUpDown, X, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

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
  } = useAppContext()

  // Estados para productos
  const [busquedaProductos, setBusquedaProductos] = useState("")
  const [ordenProductos, setOrdenProductos] = useState<"asc" | "desc">("asc")
  const [categoriasVisibles, setCategoriasVisibles] = useState<string[]>(Object.keys(productos))
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<any>(null)
  const [categoriaEditando, setCategoriaEditando] = useState<string>("")
  const [formProducto, setFormProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
  })
  const [formCategoria, setFormCategoria] = useState({
    nombre: "",
    orden: "",
  })

  // Estados para medios de pago
  const [busquedaMedios, setBusquedaMedios] = useState("")
  const [ordenMedios, setOrdenMedios] = useState<"asc" | "desc">("asc")
  const [modalMedioPagoAbierto, setModalMedioPagoAbierto] = useState(false)
  const [medioPagoEditando, setMedioPagoEditando] = useState<any>(null)
  const [formMedioPago, setFormMedioPago] = useState({
    nombre: "",
    recargo: "",
  })

  // Estados para descuentos
  const [busquedaDescuentos, setBusquedaDescuentos] = useState("")
  const [ordenDescuentos, setOrdenDescuentos] = useState<"asc" | "desc">("asc")
  const [modalDescuentoAbierto, setModalDescuentoAbierto] = useState(false)
  const [descuentoEditando, setDescuentoEditando] = useState<any>(null)
  const [formDescuento, setFormDescuento] = useState({
    nombre: "",
    porcentaje: "",
  })

  // Estados para promociones
  const [busquedaPromociones, setBusquedaPromociones] = useState("")
  const [ordenPromociones, setOrdenPromociones] = useState<"asc" | "desc">("asc")
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false)
  const [promocionEditando, setPromocionEditando] = useState<any>(null)
  const [formPromocion, setFormPromocion] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    tipo: "",
    activa: true,
  })

  // Estados para usuarios
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("")
  const [ordenUsuarios, setOrdenUsuarios] = useState<"asc" | "desc">("asc")
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null)
  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    contraseña: "",
    rol: "empleado" as "administrador" | "empleado",
  })

  // Funciones para productos
  const filtrarProductos = () => {
    const productosFiltrados: any = {}

    Object.entries(productos).forEach(([key, categoria]: [string, any]) => {
      if (categoriasVisibles.includes(key)) {
        const productosDeLaCategoria = categoria.productos.filter((producto: any) =>
          producto.nombre.toLowerCase().includes(busquedaProductos.toLowerCase()),
        )

        if (productosDeLaCategoria.length > 0) {
          productosFiltrados[key] = {
            ...categoria,
            productos: productosDeLaCategoria.sort((a: any, b: any) => {
              if (ordenProductos === "asc") {
                return a.nombre.localeCompare(b.nombre)
              } else {
                return b.nombre.localeCompare(a.nombre)
              }
            }),
          }
        }
      }
    })

    return productosFiltrados
  }

  const toggleCategoria = (categoria: string) => {
    setCategoriasVisibles((prev) =>
      prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria],
    )
  }

  const toggleTodasCategorias = () => {
    if (categoriasVisibles.length === Object.keys(productos).length) {
      setCategoriasVisibles([])
    } else {
      setCategoriasVisibles(Object.keys(productos))
    }
  }

  const abrirModalProducto = (producto?: any, categoria?: string) => {
    if (producto) {
      setProductoEditando(producto)
      setFormProducto({
        nombre: producto.nombre,
        precio: producto.precio.toString(),
        categoria: categoria || "",
        imagen: producto.imagen || "",
      })
    } else {
      setProductoEditando(null)
      setFormProducto({
        nombre: "",
        precio: "",
        categoria: "",
        imagen: "",
      })
    }
    setModalProductoAbierto(true)
  }

  const abrirModalCategoria = (categoria?: string) => {
    if (categoria) {
      setCategoriaEditando(categoria)
      setFormCategoria({
        nombre: productos[categoria].nombre,
        orden: productos[categoria].orden?.toString() || "",
      })
    } else {
      setCategoriaEditando("")
      setFormCategoria({
        nombre: "",
        orden: "",
      })
    }
    setModalCategoriaAbierto(true)
  }

  const guardarProducto = () => {
    if (!formProducto.nombre.trim() || !formProducto.precio.trim() || !formProducto.categoria.trim()) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    const precio = Number.parseFloat(formProducto.precio)
    if (isNaN(precio) || precio <= 0) {
      alert("El precio debe ser un número válido mayor a 0")
      return
    }

    const productosActualizados = { ...productos }

    if (productoEditando) {
      // Editar producto existente
      Object.keys(productosActualizados).forEach((categoriaKey) => {
        productosActualizados[categoriaKey].productos = productosActualizados[categoriaKey].productos.map((p: any) =>
          p.id === productoEditando.id ? { ...p, nombre: formProducto.nombre, precio, imagen: formProducto.imagen } : p,
        )
      })
    } else {
      // Crear nuevo producto
      const nuevoProducto = {
        id: Date.now(),
        nombre: formProducto.nombre,
        precio,
        imagen: formProducto.imagen,
      }

      if (!productosActualizados[formProducto.categoria]) {
        productosActualizados[formProducto.categoria] = {
          nombre: formProducto.categoria,
          orden: Object.keys(productosActualizados).length + 1,
          productos: [],
        }
      }

      productosActualizados[formProducto.categoria].productos.push(nuevoProducto)
    }

    setProductos(productosActualizados)
    setModalProductoAbierto(false)
    setProductoEditando(null)
    setFormProducto({ nombre: "", precio: "", categoria: "", imagen: "" })
  }

  const eliminarProducto = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este producto?")) {
      const productosActualizados = { ...productos }
      Object.keys(productosActualizados).forEach((categoriaKey) => {
        productosActualizados[categoriaKey].productos = productosActualizados[categoriaKey].productos.filter(
          (p: any) => p.id !== id,
        )
      })
      setProductos(productosActualizados)
    }
  }

  // Funciones para medios de pago
  const filtrarMediosPago = () => {
    const mediosFiltrados = mediosPago.filter((medio) =>
      medio.nombre.toLowerCase().includes(busquedaMedios.toLowerCase()),
    )

    mediosFiltrados.sort((a, b) => {
      if (ordenMedios === "asc") {
        return a.nombre.localeCompare(b.nombre)
      } else {
        return b.nombre.localeCompare(a.nombre)
      }
    })

    return mediosFiltrados
  }

  const abrirModalMedioPago = (medio?: any) => {
    if (medio) {
      setMedioPagoEditando(medio)
      setFormMedioPago({
        nombre: medio.nombre,
        recargo: medio.recargo.toString(),
      })
    } else {
      setMedioPagoEditando(null)
      setFormMedioPago({
        nombre: "",
        recargo: "",
      })
    }
    setModalMedioPagoAbierto(true)
  }

  const guardarMedioPago = () => {
    if (!formMedioPago.nombre.trim() || !formMedioPago.recargo.trim()) {
      alert("Por favor complete todos los campos")
      return
    }

    const recargo = Number.parseFloat(formMedioPago.recargo)
    if (isNaN(recargo)) {
      alert("El recargo debe ser un número válido")
      return
    }

    if (medioPagoEditando) {
      // Editar medio existente
      const mediosActualizados = mediosPago.map((medio) =>
        medio.id === medioPagoEditando.id ? { ...medio, nombre: formMedioPago.nombre, recargo } : medio,
      )
      setMediosPago(mediosActualizados)
    } else {
      // Crear nuevo medio
      const nuevoMedio = {
        id: Date.now().toString(),
        nombre: formMedioPago.nombre,
        recargo,
      }
      setMediosPago([...mediosPago, nuevoMedio])
    }

    setModalMedioPagoAbierto(false)
    setMedioPagoEditando(null)
    setFormMedioPago({ nombre: "", recargo: "" })
  }

  const eliminarMedioPago = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este medio de pago?")) {
      setMediosPago(mediosPago.filter((medio) => medio.id !== id))
    }
  }

  // Funciones para descuentos
  const filtrarDescuentos = () => {
    const descuentosFiltrados = descuentos.filter((descuento) =>
      descuento.nombre.toLowerCase().includes(busquedaDescuentos.toLowerCase()),
    )

    descuentosFiltrados.sort((a, b) => {
      if (ordenDescuentos === "asc") {
        return a.nombre.localeCompare(b.nombre)
      } else {
        return b.nombre.localeCompare(a.nombre)
      }
    })

    return descuentosFiltrados
  }

  const abrirModalDescuento = (descuento?: any) => {
    if (descuento) {
      setDescuentoEditando(descuento)
      setFormDescuento({
        nombre: descuento.nombre,
        porcentaje: descuento.porcentaje.toString(),
      })
    } else {
      setDescuentoEditando(null)
      setFormDescuento({
        nombre: "",
        porcentaje: "",
      })
    }
    setModalDescuentoAbierto(true)
  }

  const guardarDescuento = () => {
    if (!formDescuento.nombre.trim() || !formDescuento.porcentaje.trim()) {
      alert("Por favor complete todos los campos")
      return
    }

    const porcentaje = Number.parseFloat(formDescuento.porcentaje)
    if (isNaN(porcentaje) || porcentaje <= 0) {
      alert("El porcentaje debe ser un número válido mayor a 0")
      return
    }

    if (descuentoEditando) {
      // Editar descuento existente
      const descuentosActualizados = descuentos.map((descuento) =>
        descuento.id === descuentoEditando.id ? { ...descuento, nombre: formDescuento.nombre, porcentaje } : descuento,
      )
      setDescuentos(descuentosActualizados)
    } else {
      // Crear nuevo descuento
      const nuevoDescuento = {
        id: Date.now(),
        nombre: formDescuento.nombre,
        porcentaje,
      }
      setDescuentos([...descuentos, nuevoDescuento])
    }

    setModalDescuentoAbierto(false)
    setDescuentoEditando(null)
    setFormDescuento({ nombre: "", porcentaje: "" })
  }

  const eliminarDescuento = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este descuento?")) {
      setDescuentos(descuentos.filter((descuento) => descuento.id !== id))
    }
  }

  // Funciones para promociones
  const filtrarPromociones = () => {
    const promocionesFiltradas = promociones.filter((promocion) =>
      promocion.nombre.toLowerCase().includes(busquedaPromociones.toLowerCase()),
    )

    promocionesFiltradas.sort((a, b) => {
      if (ordenPromociones === "asc") {
        return a.nombre.localeCompare(b.nombre)
      } else {
        return b.nombre.localeCompare(a.nombre)
      }
    })

    return promocionesFiltradas
  }

  const abrirModalPromocion = (promocion?: any) => {
    if (promocion) {
      setPromocionEditando(promocion)
      setFormPromocion({
        nombre: promocion.nombre,
        descripcion: promocion.descripcion,
        fechaInicio: promocion.fechaInicio,
        fechaFin: promocion.fechaFin,
        tipo: promocion.tipo,
        activa: promocion.activa,
      })
    } else {
      setPromocionEditando(null)
      setFormPromocion({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        tipo: "",
        activa: true,
      })
    }
    setModalPromocionAbierto(true)
  }

  const guardarPromocion = () => {
    if (!formPromocion.nombre.trim() || !formPromocion.descripcion.trim()) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    if (promocionEditando) {
      // Editar promoción existente
      const promocionesActualizadas = promociones.map((promocion) =>
        promocion.id === promocionEditando.id ? { ...promocion, ...formPromocion } : promocion,
      )
      setPromociones(promocionesActualizadas)
    } else {
      // Crear nueva promoción
      const nuevaPromocion = {
        id: Date.now(),
        ...formPromocion,
      }
      setPromociones([...promociones, nuevaPromocion])
    }

    setModalPromocionAbierto(false)
    setPromocionEditando(null)
    setFormPromocion({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "",
      activa: true,
    })
  }

  const eliminarPromocion = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta promoción?")) {
      setPromociones(promociones.filter((promocion) => promocion.id !== id))
    }
  }

  const togglePromocion = (id: number) => {
    const promocionesActualizadas = promociones.map((promocion) =>
      promocion.id === id ? { ...promocion, activa: !promocion.activa } : promocion,
    )
    setPromociones(promocionesActualizadas)
  }

  // Funciones para usuarios
  const filtrarUsuarios = () => {
    const usuariosFiltrados = usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(busquedaUsuarios.toLowerCase()),
    )

    usuariosFiltrados.sort((a, b) => {
      if (ordenUsuarios === "asc") {
        return a.nombre.localeCompare(b.nombre)
      } else {
        return b.nombre.localeCompare(a.nombre)
      }
    })

    return usuariosFiltrados
  }

  const abrirModalUsuario = (usuario?: any) => {
    if (usuario) {
      setUsuarioEditando(usuario)
      setFormUsuario({
        nombre: usuario.nombre,
        contraseña: usuario.contraseña,
        rol: usuario.rol,
      })
    } else {
      setUsuarioEditando(null)
      setFormUsuario({
        nombre: "",
        contraseña: "",
        rol: "empleado",
      })
    }
    setModalUsuarioAbierto(true)
  }

  const guardarUsuario = () => {
    if (!formUsuario.nombre.trim() || !formUsuario.contraseña.trim()) {
      alert("Por favor complete todos los campos")
      return
    }

    if (usuarioEditando) {
      // Editar usuario existente
      const usuariosActualizados = usuarios.map((usuario) =>
        usuario.id === usuarioEditando.id ? { ...usuario, ...formUsuario } : usuario,
      )
      setUsuarios(usuariosActualizados)
    } else {
      // Crear nuevo usuario
      const nuevoUsuario = {
        id: Date.now(),
        ...formUsuario,
      }
      setUsuarios([...usuarios, nuevoUsuario])
    }

    setModalUsuarioAbierto(false)
    setUsuarioEditando(null)
    setFormUsuario({
      nombre: "",
      contraseña: "",
      rol: "empleado",
    })
  }

  const eliminarUsuario = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormProducto((prev) => ({
          ...prev,
          imagen: event.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al POS
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-600">Martine Pâtisserie</h1>
              <p className="text-gray-600">Panel de Administración</p>
            </div>
          </div>
        </div>

        {/* Agregando pestaña Usuarios al TabsList */}
        <Tabs defaultValue="productos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="pagos">Medios de Pago</TabsTrigger>
            <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
            <TabsTrigger value="promociones">Promociones</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          </TabsList>

          {/* Agregando TabsContent para usuarios */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Usuarios</CardTitle>
                <Button onClick={() => abrirModalUsuario()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </CardHeader>
              <CardContent>
                {/* Controles de búsqueda y ordenamiento */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar usuarios..."
                      value={busquedaUsuarios}
                      onChange={(e) => setBusquedaUsuarios(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {busquedaUsuarios && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setBusquedaUsuarios("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setOrdenUsuarios(ordenUsuarios === "asc" ? "desc" : "asc")}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {ordenUsuarios === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtrarUsuarios().map((usuario) => (
                    <div key={usuario.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <h4 className="font-medium">{usuario.nombre}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => abrirModalUsuario(usuario)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => eliminarUsuario(usuario.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant={usuario.rol === "administrador" ? "default" : "secondary"}>{usuario.rol}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Agregando Modal para usuarios */}
        <Dialog open={modalUsuarioAbierto} onOpenChange={setModalUsuarioAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{usuarioEditando ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre-usuario">Nombre de Usuario</Label>
                <Input
                  id="nombre-usuario"
                  value={formUsuario.nombre}
                  onChange={(e) => setFormUsuario((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ingrese el nombre de usuario"
                />
              </div>
              <div>
                <Label htmlFor="contraseña-usuario">Contraseña</Label>
                <Input
                  id="contraseña-usuario"
                  type="password"
                  value={formUsuario.contraseña}
                  onChange={(e) => setFormUsuario((prev) => ({ ...prev, contraseña: e.target.value }))}
                  placeholder="Ingrese la contraseña"
                />
              </div>
              <div>
                <Label htmlFor="rol-usuario">Rol</Label>
                <Select
                  value={formUsuario.rol}
                  onValueChange={(value: "administrador" | "empleado") =>
                    setFormUsuario((prev) => ({ ...prev, rol: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalUsuarioAbierto(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarUsuario}>{usuarioEditando ? "Actualizar" : "Crear"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ... existing modals ... */}
      </div>
    </div>
  )
}
