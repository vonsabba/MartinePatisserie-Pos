"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Edit, Trash2, Eye, Clock, Activity, Shield, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LogAcceso {
  id: string
  usuario: string
  accion: "login" | "logout" | "intento_fallido"
  timestamp: Date
  ip?: string
  dispositivo?: string
}

interface EstadisticaUsuario {
  usuario: string
  totalSesiones: number
  tiempoPromedio: number
  ultimoAcceso: Date
  ventasRealizadas: number
}

export default function AccesosPage() {
  const { usuarios, agregarUsuario, editarUsuario, eliminarUsuario } = useAppContext()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null)
  const [busqueda, setBusqueda] = useState("")
  const [logs, setLogs] = useState<LogAcceso[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticaUsuario[]>([])

  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    password: "",
    rol: "empleado" as "administrador" | "empleado",
    activo: true,
  })

  // Cargar logs desde localStorage
  useEffect(() => {
    const logsGuardados = localStorage.getItem("logs_acceso")
    if (logsGuardados) {
      const logsParseados = JSON.parse(logsGuardados).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }))
      setLogs(logsParseados)
    }

    // Generar estadísticas mock
    const statsGeneradas: EstadisticaUsuario[] = usuarios.map((usuario) => ({
      usuario: usuario.usuario,
      totalSesiones: Math.floor(Math.random() * 50) + 1,
      tiempoPromedio: Math.floor(Math.random() * 240) + 30, // minutos
      ultimoAcceso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      ventasRealizadas: Math.floor(Math.random() * 100),
    }))
    setEstadisticas(statsGeneradas)
  }, [usuarios])

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const logsFiltrados = logs
    .filter((log) => log.usuario.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const abrirModal = (usuario?: any) => {
    if (usuario) {
      setUsuarioEditando(usuario)
      setFormData({
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        password: "",
        rol: usuario.rol,
        activo: usuario.activo ?? true,
      })
    } else {
      setUsuarioEditando(null)
      setFormData({
        nombre: "",
        usuario: "",
        password: "",
        rol: "empleado",
        activo: true,
      })
    }
    setModalAbierto(true)
  }

  const guardarUsuario = () => {
    if (!formData.nombre || !formData.usuario || (!usuarioEditando && !formData.password)) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const datosUsuario = {
      id: usuarioEditando?.id || Date.now().toString(),
      nombre: formData.nombre,
      usuario: formData.usuario,
      password: formData.password || usuarioEditando?.password,
      rol: formData.rol,
      activo: formData.activo,
    }

    if (usuarioEditando) {
      editarUsuario(usuarioEditando.id, datosUsuario)
    } else {
      agregarUsuario(datosUsuario)
    }

    setModalAbierto(false)
    setUsuarioEditando(null)
  }

  const registrarLog = (usuario: string, accion: "login" | "logout" | "intento_fallido") => {
    const nuevoLog: LogAcceso = {
      id: Date.now().toString(),
      usuario,
      accion,
      timestamp: new Date(),
      ip: "192.168.1." + Math.floor(Math.random() * 255),
      dispositivo: "POS Terminal",
    }

    const logsActualizados = [nuevoLog, ...logs].slice(0, 100) // Mantener solo los últimos 100
    setLogs(logsActualizados)
    localStorage.setItem("logs_acceso", JSON.stringify(logsActualizados))
  }

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  const getIconoAccion = (accion: string) => {
    switch (accion) {
      case "login":
        return <Eye className="h-4 w-4 text-green-500" />
      case "logout":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "intento_fallido":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al POS
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-800">Control de Accesos</h1>
              <p className="text-amber-600">Gestión de usuarios y monitoreo de actividad</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-amber-600" />
            <Badge variant="secondary">{usuarios.length} usuarios</Badge>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <Input
            placeholder="Buscar usuarios o logs..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="logs">Logs de Acceso</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Pestaña Usuarios */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Administra los usuarios del sistema</CardDescription>
                  </div>
                  <Button onClick={() => abrirModal()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {usuariosFiltrados.map((usuario) => (
                    <Card key={usuario.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <CardTitle className="text-lg">{usuario.nombre}</CardTitle>
                          </div>
                          <Badge variant={usuario.rol === "administrador" ? "default" : "secondary"}>
                            {usuario.rol}
                          </Badge>
                        </div>
                        <CardDescription>@{usuario.usuario}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant={usuario.activo !== false ? "default" : "destructive"}>
                            {usuario.activo !== false ? "Activo" : "Inactivo"}
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => abrirModal(usuario)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("¿Estás seguro de eliminar este usuario?")) {
                                  eliminarUsuario(usuario.id)
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
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

          {/* Pestaña Logs */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Accesos</CardTitle>
                    <CardDescription>Historial de actividad de usuarios</CardDescription>
                  </div>
                  <Button onClick={() => registrarLog("demo", "login")} variant="outline">
                    Simular Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Dispositivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsFiltrados.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.usuario}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIconoAccion(log.accion)}
                            <span className="capitalize">{log.accion.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.dispositivo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Estadísticas */}
          <TabsContent value="estadisticas">
            <div className="grid gap-6 md:grid-cols-2">
              {estadisticas.map((stat) => (
                <Card key={stat.usuario}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {stat.usuario}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Sesiones:</span>
                      <Badge>{stat.totalSesiones}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tiempo Promedio:</span>
                      <span className="text-sm font-medium">{formatearTiempo(stat.tiempoPromedio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Último Acceso:</span>
                      <span className="text-sm">{stat.ultimoAcceso.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ventas Realizadas:</span>
                      <Badge variant="secondary">{stat.ventasRealizadas}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Usuario */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{usuarioEditando ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {usuarioEditando ? "Modifica los datos del usuario" : "Completa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  placeholder="Ej: jperez"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña {usuarioEditando && "(dejar vacío para mantener actual)"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={usuarioEditando ? "Nueva contraseña (opcional)" : "Contraseña"}
                />
              </div>
              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: "administrador" | "empleado") => setFormData({ ...formData, rol: value })}
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
              <div>
                <Label htmlFor="activo">Estado</Label>
                <Select
                  value={formData.activo ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, activo: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarUsuario}>{usuarioEditando ? "Actualizar" : "Crear"} Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
