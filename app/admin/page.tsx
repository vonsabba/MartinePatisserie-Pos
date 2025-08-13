"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  Save,
  X,
  ArrowUpDown,
  Search,
  Settings,
  Filter,
  GripVertical,
  Power,
  PowerOff,
  ImageIcon,
} from "lucide-react"

// Importar el nuevo modal
import ModalPromocionAvanzado from "@/components/modal-promocion-avanzado"

import { useAppContext } from "@/contexts/app-context"

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
  configuracion?: any // Configuración específica según el tipo
}

interface Usuario {
  id: number
  nombre: string
  contraseña: string
  rol: string
}

export default function AdminPage() {
  const {
    productos,
    setProductos,
    promociones,
    setPromociones,
    mediosPago, // usando mediosPago del contexto
    setMediosPago, // usando setMediosPago del contexto
    descuentos,
    setDescuentos,
    usuarios,
    setUsuarios,
  } = useAppContext()

  // Estados para UI
  const [tabActiva, setTabActiva] = useState("productos")
  const [modalProducto, setModalProducto] = useState(false)
  const [modalPromocion, setModalPromocion] = useState(false)
  const [modalMedioPago, setModalMedioPago] = useState(false)
  const [modalDescuento, setModalDescuento] = useState(false)
  const [modalUsuario, setModalUsuario] = useState(false)

  // Estados para formularios
  const [formProducto, setFormProducto] = useState({ id: "", nombre: "", precio: "", categoria: "", imagen: "" })
  const [formMedioPago, setFormMedioPago] = useState({ id: "", nombre: "", recargo: "" })
  const [formDescuento, setFormDescuento] = useState({ id: "", nombre: "", porcentaje: "" })
  const [formUsuario, setFormUsuario] = useState({ id: "", nombre: "", contraseña: "", rol: "" })

  // Estados para edición
  const [productoEditando, setProductoEditando] = useState<any>(null)
  const [medioPagoEditando, setMedioPagoEditando] = useState<MedioPago | null>(null)
  const [descuentoEditando, setDescuentoEditando] = useState<Descuento | null>(null)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [promocionEditando, setPromocionEditando] = useState<Promocion | null>(null)

  // Estados para búsqueda y filtros
  const [busquedaProductos, setBusquedaProductos] = useState("")
  const [busquedaMedios, setBusquedaMedios] = useState("")
  const [busquedaDescuentos, setBusquedaDescuentos] = useState("")
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas")
  const [ordenProductos, setOrdenProductos] = useState<"asc" | "desc">("asc")
  const [ordenMedios, setOrdenMedios] = useState<"asc" | "desc">("asc")
  const [ordenDescuentos, setOrdenDescuentos] = useState<"asc" | "desc">("asc")
  const [ordenUsuarios, setOrdenUsuarios] = useState<"asc" | "desc">("asc")

  // const [mediosPago, setMediosPago] = useState<MedioPago[]>([])

  const [modalCategoria, setModalCategoria] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<{ key: string; nombre: string } | null>(null)
  const [formCategoria, setFormCategoria] = useState({ key: "", nombre: "" })
  const [busquedaPromociones, setBusquedaPromociones] = useState("")
  const [ordenPromociones, setOrdenPromociones] = useState<"asc" | "desc">("asc")
  const [categoriasVisibles, setCategoriasVisibles] = useState<string[]>(Object.keys(productos))
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null)

  // Funciones para productos
  const abrirModalProducto = (producto?: Producto, categoria?: string) => {
    if (producto && categoria) {
      setProductoEditando(producto)
      setFormProducto({
        nombre: producto.nombre,
        precio: producto.precio.toString(),
        categoria,
        imagen: producto.imagen || "",
        id: producto.id.toString(),
      })
    } else {
      setProductoEditando(null)
      setFormProducto({ nombre: "", precio: "", categoria: "", imagen: "", id: "" })
    }
    setModalProducto(true)
  }

  const guardarProducto = () => {
    if (!formProducto.nombre || !formProducto.precio || !formProducto.categoria) return

    const nuevoProducto: Producto = {
      id: productoEditando?.id || Date.now(),
      nombre: formProducto.nombre,
      precio: Number.parseFloat(formProducto.precio),
      imagen: formProducto.imagen || undefined,
    }

    setProductos((prev) => {
      const nuevosProductos = { ...prev }

      if (productoEditando) {
        // Editar producto existente
        Object.keys(nuevosProductos).forEach((cat) => {
          nuevosProductos[cat as keyof typeof nuevosProductos].productos = nuevosProductos[
            cat as keyof typeof nuevosProductos
          ].productos.map((p) => (p.id === productoEditando.id ? nuevoProducto : p))
        })
      } else {
        // Agregar nuevo producto
        if (nuevosProductos[formProducto.categoria as keyof typeof nuevosProductos]) {
          nuevosProductos[formProducto.categoria as keyof typeof nuevosProductos].productos.push(nuevoProducto)
        }
      }

      return nuevosProductos
    })

    setModalProducto(false)
    setFormProducto({ nombre: "", precio: "", categoria: "", imagen: "", id: "" })
    setProductoEditando(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormProducto((prev) => ({ ...prev, imagen: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const eliminarProducto = (id: number) => {
    setProductos((prev) => {
      const nuevosProductos = { ...prev }
      Object.keys(nuevosProductos).forEach((cat) => {
        nuevosProductos[cat as keyof typeof nuevosProductos].productos = nuevosProductos[
          cat as keyof typeof nuevosProductos
        ].productos.filter((p) => p.id !== id)
      })
      return nuevosProductos
    })
  }

  // Funciones para medios de pago
  const abrirModalMedioPago = (medio?: MedioPago) => {
    if (medio) {
      setMedioPagoEditando(medio)
      setFormMedioPago({
        id: medio.id,
        nombre: medio.nombre,
        recargo: medio.recargo.toString(),
      })
    } else {
      setMedioPagoEditando(null)
      setFormMedioPago({ id: "", nombre: "", recargo: "" })
    }
    setModalMedioPago(true)
  }

  const guardarMedioPago = () => {
    if (!formMedioPago.nombre || !formMedioPago.recargo) return

    const nuevoMedio: MedioPago = {
      id: formMedioPago.id || formMedioPago.nombre.toLowerCase().replace(/\s+/g, ""),
      nombre: formMedioPago.nombre,
      recargo: Number.parseFloat(formMedioPago.recargo),
    }

    setMediosPago((prev) => {
      if (medioPagoEditando) {
        return prev.map((m) => (m.id === medioPagoEditando.id ? nuevoMedio : m))
      }
      return [...prev, nuevoMedio]
    })

    setModalMedioPago(false)
    setFormMedioPago({ id: "", nombre: "", recargo: "" })
    setMedioPagoEditando(null)
  }

  const eliminarMedioPago = (id: string) => {
    setMediosPago((prev) => prev.filter((m) => m.id !== id))
  }

  // Funciones para descuentos
  const abrirModalDescuento = (descuento?: Descuento) => {
    if (descuento) {
      setDescuentoEditando(descuento)
      setFormDescuento({
        nombre: descuento.nombre,
        porcentaje: descuento.porcentaje.toString(),
        id: descuento.id.toString(),
      })
    } else {
      setDescuentoEditando(null)
      setFormDescuento({ nombre: "", porcentaje: "", id: "" })
    }
    setModalDescuento(true)
  }

  const guardarDescuento = () => {
    if (!formDescuento.nombre || !formDescuento.porcentaje) return

    const nuevoDescuento: Descuento = {
      id: descuentoEditando?.id || Date.now(),
      nombre: formDescuento.nombre,
      porcentaje: Number.parseFloat(formDescuento.porcentaje),
    }

    setDescuentos((prev) => {
      if (descuentoEditando) {
        return prev.map((d) => (d.id === descuentoEditando.id ? nuevoDescuento : d))
      }
      return [...prev, nuevoDescuento]
    })

    setModalDescuento(false)
    setFormDescuento({ nombre: "", porcentaje: "", id: "" })
    setDescuentoEditando(null)
  }

  const eliminarDescuento = (id: number) => {
    setDescuentos((prev) => prev.filter((d) => d.id !== id))
  }

  // Funciones para categorías
  const abrirModalCategoria = (categoria?: { key: string; nombre: string }) => {
    if (categoria) {
      setCategoriaEditando(categoria)
      setFormCategoria({ key: categoria.key, nombre: categoria.nombre })
    } else {
      setCategoriaEditando(null)
      setFormCategoria({ key: "", nombre: "" })
    }
    setModalCategoria(true)
  }

  const guardarCategoria = () => {
    if (!formCategoria.nombre) return

    const nuevaKey = formCategoria.key || formCategoria.nombre.toLowerCase().replace(/\s+/g, "")

    setProductos((prev) => {
      const nuevosProductos = { ...prev }

      if (categoriaEditando) {
        // Editar categoría existente
        if (categoriaEditando.key !== nuevaKey) {
          // Cambiar key de categoría
          nuevosProductos[nuevaKey as keyof typeof nuevosProductos] = {
            ...nuevosProductos[categoriaEditando.key as keyof typeof nuevosProductos],
            nombre: formCategoria.nombre,
          }
          delete nuevosProductos[categoriaEditando.key as keyof typeof nuevosProductos]
        } else {
          // Solo cambiar nombre
          nuevosProductos[categoriaEditando.key as keyof typeof nuevosProductos].nombre = formCategoria.nombre
        }
      } else {
        // Agregar nueva categoría
        const maxOrden = Math.max(...Object.values(nuevosProductos).map((cat) => cat.orden || 0))
        nuevosProductos[nuevaKey as keyof typeof nuevosProductos] = {
          nombre: formCategoria.nombre,
          orden: maxOrden + 1,
          productos: [],
        }
        setCategoriasVisibles((prev) => [...prev, nuevaKey])
      }

      return nuevosProductos
    })

    setModalCategoria(false)
    setFormCategoria({ key: "", nombre: "" })
    setCategoriaEditando(null)
  }

  const eliminarCategoria = (key: string) => {
    const categoria = productos[key as keyof typeof productos]
    if (categoria && categoria.productos.length > 0) {
      alert("No se puede eliminar una categoría que tiene productos")
      return
    }

    setProductos((prev) => {
      const nuevosProductos = { ...prev }
      delete nuevosProductos[key as keyof typeof nuevosProductos]
      return nuevosProductos
    })

    setCategoriasVisibles((prev) => prev.filter((cat) => cat !== key))
  }

  // Funciones de drag and drop para categorías
  const handleDragStart = (e: React.DragEvent, categoryKey: string) => {
    setDraggedCategory(categoryKey)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault()

    if (!draggedCategory || draggedCategory === targetKey) {
      setDraggedCategory(null)
      return
    }

    setProductos((prev) => {
      const nuevosProductos = { ...prev }
      const categorias = Object.entries(nuevosProductos).sort(([, a], [, b]) => (a.orden || 0) - (b.orden || 0))

      const draggedIndex = categorias.findIndex(([key]) => key === draggedCategory)
      const targetIndex = categorias.findIndex(([key]) => key === targetKey)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      // Reordenar
      const [draggedItem] = categorias.splice(draggedIndex, 1)
      categorias.splice(targetIndex, 0, draggedItem)

      // Actualizar órdenes
      categorias.forEach(([key, categoria], index) => {
        nuevosProductos[key as keyof typeof nuevosProductos].orden = index + 1
      })

      return nuevosProductos
    })

    setDraggedCategory(null)
  }

  // Funciones de filtrado y ordenamiento
  const filtrarProductos = () => {
    const productosFiltrados = {}

    // Ordenar categorías por orden personalizado
    const categoriasOrdenadas = Object.entries(productos)
      .sort(([, a], [, b]) => (a.orden || 0) - (b.orden || 0))
      .filter(([key]) => categoriasVisibles.includes(key))

    categoriasOrdenadas.forEach(([key, categoria]) => {
      productosFiltrados[key as keyof typeof productos] = {
        nombre: categoria.nombre,
        orden: categoria.orden,
        productos: categoria.productos
          .filter((p) => p.nombre.toLowerCase().includes(busquedaProductos.toLowerCase()))
          .sort((a, b) => {
            if (ordenProductos === "asc") {
              return a.nombre.localeCompare(b.nombre)
            }
            return b.nombre.localeCompare(a.nombre)
          }),
      }
    })

    return productosFiltrados
  }

  const filtrarMediosPago = () => {
    return mediosPago
      .filter((m) => m.nombre.toLowerCase().includes(busquedaMedios.toLowerCase()))
      .sort((a, b) => {
        if (ordenMedios === "asc") {
          return a.nombre.localeCompare(b.nombre)
        }
        return b.nombre.localeCompare(a.nombre)
      })
  }

  const filtrarDescuentos = () => {
    return descuentos
      .filter((d) => d.nombre.toLowerCase().includes(busquedaDescuentos.toLowerCase()))
      .sort((a, b) => {
        if (ordenDescuentos === "asc") {
          return a.nombre.localeCompare(b.nombre)
        }
        return b.nombre.localeCompare(a.nombre)
      })
  }

  const filtrarUsuarios = () => {
    return usuarios
      .filter((u) => u.nombre.toLowerCase().includes(busquedaUsuarios.toLowerCase()))
      .sort((a, b) => {
        if (ordenUsuarios === "asc") {
          return a.nombre.localeCompare(b.nombre)
        }
        return b.nombre.localeCompare(a.nombre)
      })
  }

  const toggleCategoria = (key: string) => {
    setCategoriasVisibles((prev) => (prev.includes(key) ? prev.filter((cat) => cat !== key) : [...prev, key]))
  }

  const toggleTodasCategorias = () => {
    const todasLasCategorias = Object.keys(productos)
    setCategoriasVisibles((prev) => (prev.length === todasLasCategorias.length ? [] : todasLasCategorias))
  }

  // Funciones para promociones
  const abrirModalPromocion = (promocion?: Promocion) => {
    if (promocion) {
      setPromocionEditando(promocion)
    } else {
      setPromocionEditando(null)
    }
    setModalPromocion(true)
  }

  const guardarPromocion = () => {
    // if (
    //   !formPromocion.nombre ||
    //   !formPromocion.descripcion ||
    //   !formPromocion.fechaInicio ||
    //   !formPromocion.fechaFin ||
    //   !formPromocion.tipo
    // )
    //   return

    // const nuevaPromocion: Promocion = {
    //   id: promocionEditando?.id || Date.now(),
    //   nombre: formPromocion.nombre,
    //   descripcion: formPromocion.descripcion,
    //   activa: formPromocion.activa,
    //   fechaInicio: formPromocion.fechaInicio,
    //   fechaFin: formPromocion.fechaFin,
    //   tipo: formPromocion.tipo,
    //   configuracion: formPromocion.configuracion,
    // }

    // setPromociones((prev) => {
    //   if (promocionEditando) {
    //     return prev.map((p) => (p.id === promocionEditando.id ? nuevaPromocion : p))
    //   }
    //   return [...prev, nuevaPromocion]
    // })

    setModalPromocion(false)
    // setFormPromocion({
    //   nombre: "",
    //   descripcion: "",
    //   activa: true,
    //   fechaInicio: "",
    //   fechaFin: "",
    //   tipo: "",
    //   configuracion: {},
    // })
    // setPromocionEditando(null)
  }

  const eliminarPromocion = (id: number) => {
    setPromociones((prev) => prev.filter((p) => p.id !== id))
  }

  const togglePromocion = (id: number) => {
    setPromociones((prev) => prev.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)))
  }

  const filtrarPromociones = () => {
    return promociones
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaPromociones.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(busquedaPromociones.toLowerCase()),
      )
      .sort((a, b) => {
        if (ordenPromociones === "asc") {
          return a.nombre.localeCompare(b.nombre)
        }
        return b.nombre.localeCompare(a.nombre)
      })
  }

  // Funciones para usuarios
  const abrirModalUsuario = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEditando(usuario)
      setFormUsuario({
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        contraseña: usuario.contraseña,
        rol: usuario.rol,
      })
    } else {
      setUsuarioEditando(null)
      setFormUsuario({ id: "", nombre: "", contraseña: "", rol: "" })
    }
    setModalUsuario(true)
  }

  const guardarUsuario = () => {
    if (!formUsuario.nombre || !formUsuario.contraseña || !formUsuario.rol) return

    const nuevoUsuario: Usuario = {
      id: usuarioEditando?.id || Date.now(),
      nombre: formUsuario.nombre,
      contraseña: formUsuario.contraseña,
      rol: formUsuario.rol,
    }

    setUsuarios((prev) => {
      if (usuarioEditando) {
        return prev.map((u) => (u.id === usuarioEditando.id ? nuevoUsuario : u))
      }
      return [...prev, nuevoUsuario]
    })

    setModalUsuario(false)
    setFormUsuario({ id: "", nombre: "", contraseña: "", rol: "" })
    setUsuarioEditando(null)
  }

  const eliminarUsuario = (id: number) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/mp-logo.svg" alt="MP Logo" width={150} height={60} className="h-12 w-auto" />
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al POS
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="productos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="pagos">Medios de Pago</TabsTrigger>
            <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
            <TabsTrigger value="promociones">Promociones</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          </TabsList>

          {/* Tab de Productos */}
          <TabsContent value="productos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Productos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => abrirModalCategoria()}>
                    <Settings className="h-4 w-4 mr-2" />
                    Categorías
                  </Button>
                  <Button onClick={() => abrirModalProducto()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Controles de búsqueda, ordenamiento y filtros */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={busquedaProductos}
                      onChange={(e) => setBusquedaProductos(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {busquedaProductos && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setBusquedaProductos("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setOrdenProductos(ordenProductos === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {ordenProductos === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Categorías ({categoriasVisibles.length}/{Object.keys(productos).length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuCheckboxItem
                        checked={categoriasVisibles.length === Object.keys(productos).length}
                        onCheckedChange={toggleTodasCategorias}
                        className="font-medium"
                      >
                        Todas las categorías
                      </DropdownMenuCheckboxItem>
                      {Object.entries(productos)
                        .sort(([, a], [, b]) => (a.orden || 0) - (b.orden || 0))
                        .map(([key, categoria]) => (
                          <DropdownMenuCheckboxItem
                            key={key}
                            checked={categoriasVisibles.includes(key)}
                            onCheckedChange={() => toggleCategoria(key)}
                          >
                            {categoria.nombre} ({categoria.productos.length})
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-6">
                  {Object.entries(filtrarProductos()).map(([categoriaKey, categoria]) => (
                    <div key={categoriaKey} className="space-y-3">
                      <h3 className="text-lg font-semibold border-b pb-2 text-[rgba(188,149,54,1)]">
                        {categoria.nombre} ({categoria.productos.length} productos)
                      </h3>
                      {categoria.productos.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">
                          {busquedaProductos
                            ? "No hay productos que coincidan con la búsqueda"
                            : "No hay productos en esta categoría"}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                          {filtrarProductos()[categoriaKey as keyof typeof filtrarProductos].productos.map(
                            (producto) => (
                              <div
                                key={producto.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      {producto.imagen ? (
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                          <Image
                                            src={producto.imagen || "/placeholder.svg"}
                                            alt={producto.nombre}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                          <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{producto.nombre}</h3>
                                        <p className="text-lg font-bold text-green-600">
                                          ${producto.precio.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => abrirModalProducto(producto, categoriaKey)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      className="bg-[rgba(188,149,54,1)]"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => eliminarProducto(producto.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Medios de Pago */}
          <TabsContent value="pagos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Medios de Pago</CardTitle>
                <Button onClick={() => abrirModalMedioPago()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Medio de Pago
                </Button>
              </CardHeader>
              <CardContent>
                {/* Controles de búsqueda y ordenamiento */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar medios de pago..."
                      value={busquedaMedios}
                      onChange={(e) => setBusquedaMedios(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {busquedaMedios && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setBusquedaMedios("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setOrdenMedios(ordenMedios === "asc" ? "desc" : "asc")}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {ordenMedios === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtrarMediosPago().map((medio) => (
                    <div key={medio.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{medio.nombre}</h4>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => abrirModalMedioPago(medio)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => eliminarMedioPago(medio.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Recargo: {medio.recargo}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Descuentos */}
          <TabsContent value="descuentos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Descuentos Disponibles</CardTitle>
                <Button onClick={() => abrirModalDescuento()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Descuento
                </Button>
              </CardHeader>
              <CardContent>
                {/* Controles de búsqueda y ordenamiento */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar descuentos..."
                      value={busquedaDescuentos}
                      onChange={(e) => setBusquedaDescuentos(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {busquedaDescuentos && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setBusquedaDescuentos("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setOrdenDescuentos(ordenDescuentos === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {ordenDescuentos === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtrarDescuentos().map((descuento) => (
                    <div key={descuento.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{descuento.nombre}</h4>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => abrirModalDescuento(descuento)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => eliminarDescuento(descuento.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Descuento: {descuento.porcentaje}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Promociones */}
          <TabsContent value="promociones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Promociones</CardTitle>
                <Button onClick={() => abrirModalPromocion()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Promoción
                </Button>
              </CardHeader>
              <CardContent>
                {/* Controles de búsqueda y ordenamiento */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar promociones..."
                      value={busquedaPromociones}
                      onChange={(e) => setBusquedaPromociones(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {busquedaPromociones && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setBusquedaPromociones("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setOrdenPromociones(ordenPromociones === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {ordenPromociones === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </div>

                {/* Promociones Activas */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-green-700 border-b pb-2">
                    Promociones Activas ({filtrarPromociones().filter((p) => p.activa).length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtrarPromociones()
                      .filter((p) => p.activa)
                      .map((promocion) => (
                        <div key={promocion.id} className="p-4 border-2 border-green-200 rounded-lg bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-green-800">{promocion.nombre}</h4>
                              <p className="text-sm text-gray-600 mt-1">{promocion.descripcion}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>Desde: {new Date(promocion.fechaInicio).toLocaleDateString()}</span>
                                <span>Hasta: {new Date(promocion.fechaFin).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setPromocionEditando(promocion)
                                  abrirModalPromocion(promocion)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePromocion(promocion.id)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <PowerOff className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => eliminarPromocion(promocion.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Activa
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {promocion.tipo}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                  {filtrarPromociones().filter((p) => p.activa).length === 0 && (
                    <p className="text-gray-500 text-sm italic">No hay promociones activas</p>
                  )}
                </div>

                {/* Promociones Inactivas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-500 border-b pb-2">
                    Promociones Inactivas ({filtrarPromociones().filter((p) => !p.activa).length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtrarPromociones()
                      .filter((p) => !p.activa)
                      .map((promocion) => (
                        <div key={promocion.id} className="p-4 border rounded-lg bg-gray-50 opacity-75">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-600">{promocion.nombre}</h4>
                              <p className="text-sm text-gray-500 mt-1">{promocion.descripcion}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                <span>Desde: {new Date(promocion.fechaInicio).toLocaleDateString()}</span>
                                <span>Hasta: {new Date(promocion.fechaFin).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setPromocionEditando(promocion)
                                  abrirModalPromocion(promocion)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePromocion(promocion.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => eliminarPromocion(promocion.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                              Inactiva
                            </Badge>
                            <Badge variant="outline" className="text-xs text-gray-500">
                              {promocion.tipo}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                  {filtrarPromociones().filter((p) => !p.activa).length === 0 && (
                    <p className="text-gray-500 text-sm italic">No hay promociones inactivas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuarios</CardTitle>
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
                        <div className="flex-1">
                          <h4 className="font-medium">{usuario.nombre}</h4>
                          <Badge variant={usuario.rol === "administrador" ? "default" : "secondary"} className="mt-1">
                            {usuario.rol}
                          </Badge>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All modals remain the same as before */}
        {/* Modal Producto */}
        <Dialog open={modalProducto} onOpenChange={setModalProducto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{productoEditando ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre-producto">Nombre</Label>
                <Input
                  id="nombre-producto"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <Label htmlFor="precio-producto">Precio</Label>
                <Input
                  id="precio-producto"
                  type="number"
                  value={formProducto.precio}
                  onChange={(e) => setFormProducto((prev) => ({ ...prev, precio: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="categoria-producto">Categoría</Label>
                <Select
                  value={formProducto.categoria}
                  onValueChange={(value) => setFormProducto((prev) => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(productos)
                      .sort(([, a], [, b]) => (a.orden || 0) - (b.orden || 0))
                      .map(([key, categoria]) => (
                        <SelectItem key={key} value={key}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="imagen-producto">Imagen del producto</Label>
                <div className="space-y-2">
                  <Input
                    id="imagen-producto"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {formProducto.imagen && (
                    <div className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
                        <Image
                          src={formProducto.imagen || "/placeholder.svg"}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Imagen seleccionada</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormProducto((prev) => ({ ...prev, imagen: "" }))}
                          className="mt-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Quitar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={guardarProducto} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {productoEditando ? "Actualizar" : "Crear"}
                </Button>
                <Button variant="outline" onClick={() => setModalProducto(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Medio de Pago */}
        <Dialog open={modalMedioPago} onOpenChange={setModalMedioPago}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{medioPagoEditando ? "Editar Medio de Pago" : "Nuevo Medio de Pago"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre-medio">Nombre</Label>
                <Input
                  id="nombre-medio"
                  value={formMedioPago.nombre}
                  onChange={(e) => setFormMedioPago((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Débito"
                />
              </div>
              <div>
                <Label htmlFor="recargo-medio">Recargo/Descuento (%)</Label>
                <Input
                  id="recargo-medio"
                  type="number"
                  step="0.01"
                  value={formMedioPago.recargo}
                  onChange={(e) => setFormMedioPago((prev) => ({ ...prev, recargo: e.target.value }))}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Valores positivos = recargo, valores negativos = descuento</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={guardarMedioPago} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setModalMedioPago(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Descuento */}
        <Dialog open={modalDescuento} onOpenChange={setModalDescuento}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{descuentoEditando ? "Editar Descuento" : "Nuevo Descuento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre-descuento">Nombre</Label>
                <Input
                  id="nombre-descuento"
                  value={formDescuento.nombre}
                  onChange={(e) => setFormDescuento((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: 15% OFF"
                />
              </div>
              <div>
                <Label htmlFor="porcentaje-descuento">Porcentaje</Label>
                <Input
                  id="porcentaje-descuento"
                  type="number"
                  value={formDescuento.porcentaje}
                  onChange={(e) => setFormDescuento((prev) => ({ ...prev, porcentaje: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={guardarDescuento} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setModalDescuento(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Categoría */}
        <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gestión de Categorías</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Lista de categorías existentes con drag and drop */}
              <div className="space-y-2">
                <Label>Categorías existentes (arrastra para reordenar):</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(productos)
                    .sort(([, a], [, b]) => (a.orden || 0) - (b.orden || 0))
                    .map(([key, categoria]) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3 border rounded cursor-move transition-colors ${
                          draggedCategory === key ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, key)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, key)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{categoria.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">({categoria.productos.length} productos)</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => abrirModalCategoria({ key, nombre: categoria.nombre })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarCategoria(key)}
                            disabled={categoria.productos.length > 0}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Formulario para nueva/editar categoría */}
              <div className="border-t pt-4">
                <Label htmlFor="nombre-categoria">{categoriaEditando ? "Editar categoría" : "Nueva categoría"}</Label>
                <Input
                  id="nombre-categoria"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={guardarCategoria} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {categoriaEditando ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalCategoria(false)
                    setCategoriaEditando(null)
                    setFormCategoria({ key: "", nombre: "" })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Promoción Avanzado */}
        <ModalPromocionAvanzado
          open={modalPromocion}
          onOpenChange={(open) => {
            setModalPromocion(open)
            if (!open) {
              setPromocionEditando(null)
            }
          }}
          promocion={promocionEditando}
          onGuardar={(nuevaPromocion) => {
            if (promocionEditando) {
              // Editar promoción existente
              setPromociones((prev) =>
                prev.map((p) => (p.id === promocionEditando.id ? { ...nuevaPromocion, id: promocionEditando.id } : p)),
              )
            } else {
              // Crear nueva promoción
              setPromociones((prev) => [...prev, { ...nuevaPromocion, id: Date.now() }])
            }
            setPromocionEditando(null)
            setModalPromocion(false)
          }}
          productos={productos}
        />

        {/* Modal Usuario */}
        <Dialog open={modalUsuario} onOpenChange={setModalUsuario}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{usuarioEditando ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre-usuario">Nombre</Label>
                <Input
                  id="nombre-usuario"
                  value={formUsuario.nombre}
                  onChange={(e) => setFormUsuario((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <Label htmlFor="contraseña-usuario">Contraseña</Label>
                <Input
                  id="contraseña-usuario"
                  type="password"
                  value={formUsuario.contraseña}
                  onChange={(e) => setFormUsuario((prev) => ({ ...prev, contraseña: e.target.value }))}
                  placeholder="Contraseña del usuario"
                />
              </div>
              <div>
                <Label htmlFor="rol-usuario">Rol</Label>
                <Select
                  value={formUsuario.rol}
                  onValueChange={(value) => setFormUsuario((prev) => ({ ...prev, rol: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="cajero">Cajero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={guardarUsuario} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setModalUsuario(false)}>
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
