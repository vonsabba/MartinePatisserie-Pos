"use client"

import { useState, useEffect, useMemo } from "react"

interface Producto {
  id: number
  nombre: string
  precio: number
}

interface ItemVenta {
  producto: Producto
  cantidad: number
}

interface ProductoCombo {
  id?: number
  categoriaId?: string
  cantidad: number
}

interface ConfiguracionPromocion {
  categorias?: string[]
  productos?: ProductoCombo[]
  precioCombo?: number
  categoria?: string
  cantidadMinima?: number
  porcentaje?: number
  acumulable?: boolean // Nueva propiedad
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

interface PromocionDetectada {
  promocion: Promocion
  aplicable: boolean
  descuento: number
  descripcionAplicacion: string
  itemsAfectados: number[]
}

export function usePromociones(carrito: ItemVenta[], promociones: Promocion[], productos: any) {
  const [promocionesDetectadas, setPromocionesDetectadas] = useState<PromocionDetectada[]>([])

  // Función para obtener la categoría de un producto
  const obtenerCategoriaProducto = (productoId: number): string | null => {
    for (const [catKey, categoria] of Object.entries(productos)) {
      const producto = (categoria as any).productos.find((p: Producto) => p.id === productoId)
      if (producto) return catKey
    }
    return null
  }

  // Función para verificar si un producto coincide con la configuración
  const productoCoincideConConfig = (productoId: number, config: ProductoCombo): boolean => {
    if (config.id !== undefined && config.id > 0) {
      return productoId === config.id
    }
    if (config.categoriaId) {
      return obtenerCategoriaProducto(productoId) === config.categoriaId
    }
    return false
  }

  // Detectar promociones 2x1 - CORREGIDO para combinar productos
  const detectar2x1 = (promocion: Promocion): PromocionDetectada => {
    const config = promocion.configuracion
    if (!config?.productos || config.productos.length === 0) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: "Configuración inválida - no hay productos configurados",
        itemsAfectados: [],
      }
    }

    console.log("🔍 Detectando 2x1:", promocion.nombre)
    console.log("📦 Carrito:", carrito)
    console.log("⚙️ Configuración:", config.productos)

    // CAMBIO CLAVE: Recopilar TODOS los items que coincidan con CUALQUIER configuración
    const todosLosItemsCoincidentes: ItemVenta[] = []

    for (const configProducto of config.productos) {
      console.log("🔎 Buscando productos que coincidan con:", configProducto)

      const itemsCoincidentes = carrito.filter((item) => {
        const coincide = productoCoincideConConfig(item.producto.id, configProducto)
        console.log(`  - ${item.producto.nombre} (ID: ${item.producto.id}): ${coincide ? "✅" : "❌"}`)
        return coincide
      })

      // Agregar todos los items coincidentes (evitando duplicados)
      for (const item of itemsCoincidentes) {
        const yaExiste = todosLosItemsCoincidentes.find((existente) => existente.producto.id === item.producto.id)
        if (!yaExiste) {
          todosLosItemsCoincidentes.push(item)
        }
      }
    }

    console.log("✅ TODOS los items coincidentes combinados:", todosLosItemsCoincidentes)

    if (todosLosItemsCoincidentes.length === 0) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: "No hay productos que coincidan con la promoción",
        itemsAfectados: [],
      }
    }

    // Contar la cantidad total de productos coincidentes
    const cantidadTotal = todosLosItemsCoincidentes.reduce((sum, item) => sum + item.cantidad, 0)
    console.log("📊 Cantidad total combinada:", cantidadTotal)

    if (cantidadTotal < 2) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: `Necesitas ${2 - cantidadTotal} producto(s) más para el 2x1`,
        itemsAfectados: [],
      }
    }

    // Calcular cuántos pares de 2x1 podemos hacer
    const cantidadPares = Math.floor(cantidadTotal / 2)
    console.log("👥 Pares posibles:", cantidadPares)

    // Crear una lista de todos los productos individuales (expandiendo las cantidades)
    const productosIndividuales: { producto: Producto; precio: number }[] = []
    for (const item of todosLosItemsCoincidentes) {
      for (let i = 0; i < item.cantidad; i++) {
        productosIndividuales.push({
          producto: item.producto,
          precio: item.producto.precio,
        })
      }
    }

    // Ordenar por precio (más caro primero)
    productosIndividuales.sort((a, b) => b.precio - a.precio)
    console.log(
      "💰 Productos individuales ordenados por precio:",
      productosIndividuales.map((p) => `${p.producto.nombre}: $${p.precio}`),
    )

    // Para cada par, descontamos el más barato
    let totalDescuento = 0
    const itemsAfectados: number[] = []

    for (let i = 0; i < cantidadPares; i++) {
      const indiceMasCaro = i * 2
      const indiceMasBarato = i * 2 + 1

      const productoMasBarato = productosIndividuales[indiceMasBarato]
      totalDescuento += productoMasBarato.precio

      console.log(`💸 Par ${i + 1}: Descontando ${productoMasBarato.producto.nombre} ($${productoMasBarato.precio})`)
    }

    // Agregar todos los productos afectados a la lista
    todosLosItemsCoincidentes.forEach((item) => {
      itemsAfectados.push(item.producto.id)
    })

    console.log("💰 Descuento total:", totalDescuento)

    const resultado = {
      promocion,
      aplicable: totalDescuento > 0,
      descuento: totalDescuento,
      descripcionAplicacion: `${cantidadPares} par(es) de 2x1 aplicado(s) - se descuentan los productos más baratos`,
      itemsAfectados,
    }

    console.log("🎯 Resultado 2x1:", resultado)
    return resultado
  }

  // Detectar combos
  const detectarCombo = (promocion: Promocion): PromocionDetectada => {
    const config = promocion.configuracion
    if (!config?.productos || !config.precioCombo) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: "Configuración inválida",
        itemsAfectados: [],
      }
    }

    // Verificar si tenemos todos los productos del combo
    let puedeAplicarCombo = true
    const itemsAfectados: number[] = []
    let precioOriginal = 0

    for (const configProducto of config.productos) {
      const itemsCoincidentes = carrito.filter((item) => productoCoincideConConfig(item.producto.id, configProducto))

      const cantidadDisponible = itemsCoincidentes.reduce((sum, item) => sum + item.cantidad, 0)

      if (cantidadDisponible < configProducto.cantidad) {
        puedeAplicarCombo = false
        break
      }

      // Calcular precio original (tomar el más barato si es por categoría)
      const itemMasBarato = itemsCoincidentes.sort((a, b) => a.producto.precio - b.producto.precio)[0]
      precioOriginal += itemMasBarato.producto.precio * configProducto.cantidad

      itemsAfectados.push(...itemsCoincidentes.slice(0, configProducto.cantidad).map((item) => item.producto.id))
    }

    const descuento = puedeAplicarCombo ? Math.max(0, precioOriginal - config.precioCombo) : 0

    return {
      promocion,
      aplicable: puedeAplicarCombo,
      descuento,
      descripcionAplicacion: puedeAplicarCombo
        ? `Combo aplicado: $${precioOriginal} → $${config.precioCombo}`
        : "Faltan productos para el combo",
      itemsAfectados,
    }
  }

  // Detectar descuento por cantidad
  const detectarDescuentoCantidad = (promocion: Promocion): PromocionDetectada => {
    const config = promocion.configuracion
    if (!config?.productos || !config.cantidadMinima || !config.porcentaje) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: "Configuración inválida",
        itemsAfectados: [],
      }
    }

    let totalCantidad = 0
    const itemsAfectados: number[] = []
    let precioTotal = 0

    // Contar productos que coinciden con la configuración
    for (const configProducto of config.productos) {
      const itemsCoincidentes = carrito.filter((item) => productoCoincideConConfig(item.producto.id, configProducto))

      for (const item of itemsCoincidentes) {
        totalCantidad += item.cantidad
        precioTotal += item.producto.precio * item.cantidad
        itemsAfectados.push(item.producto.id)
      }
    }

    const aplicable = totalCantidad >= config.cantidadMinima
    const descuento = aplicable ? (precioTotal * config.porcentaje) / 100 : 0

    return {
      promocion,
      aplicable,
      descuento,
      descripcionAplicacion: aplicable
        ? `${config.porcentaje}% OFF por ${totalCantidad} productos (mín: ${config.cantidadMinima})`
        : `Necesitas ${config.cantidadMinima - totalCantidad} productos más`,
      itemsAfectados,
    }
  }

  // Detectar descuento general
  const detectarDescuentoGeneral = (promocion: Promocion): PromocionDetectada => {
    const config = promocion.configuracion
    if (!config?.porcentaje) {
      return {
        promocion,
        aplicable: false,
        descuento: 0,
        descripcionAplicacion: "Configuración inválida",
        itemsAfectados: [],
      }
    }

    const precioTotal = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
    const descuento = (precioTotal * config.porcentaje) / 100

    return {
      promocion,
      aplicable: carrito.length > 0,
      descuento,
      descripcionAplicacion: `${config.porcentaje}% OFF en toda la compra`,
      itemsAfectados: carrito.map((item) => item.producto.id),
    }
  }

  // Función principal para detectar promociones
  const detectarPromociones = useMemo(() => {
    const promocionesActivas = promociones.filter((p) => {
      if (!p.activa) return false

      const hoy = new Date()
      const fechaInicio = new Date(p.fechaInicio)
      const fechaFin = new Date(p.fechaFin)

      return hoy >= fechaInicio && hoy <= fechaFin
    })

    const promocionesDetectadas: PromocionDetectada[] = []

    for (const promocion of promocionesActivas) {
      let resultado: PromocionDetectada

      switch (promocion.tipo) {
        case "2x1":
          resultado = detectar2x1(promocion)
          break
        case "combo":
          resultado = detectarCombo(promocion)
          break
        case "descuento-cantidad":
          resultado = detectarDescuentoCantidad(promocion)
          break
        case "descuento-general":
          resultado = detectarDescuentoGeneral(promocion)
          break
        default:
          continue
      }

      promocionesDetectadas.push(resultado)
    }

    return promocionesDetectadas
  }, [carrito, promociones, productos])

  useEffect(() => {
    setPromocionesDetectadas(detectarPromociones)
  }, [detectarPromociones])

  // Calcular promociones aplicables considerando acumulabilidad
  const promocionesAplicables = useMemo(() => {
    const aplicables = promocionesDetectadas.filter((p) => p.aplicable)
    if (aplicables.length === 0) return []

    // Separar promociones acumulables y no acumulables
    const acumulables = aplicables.filter((p) => p.promocion.configuracion?.acumulable === true)
    const noAcumulables = aplicables.filter((p) => p.promocion.configuracion?.acumulable !== true)

    // Si hay promociones no acumulables, tomar solo la mejor
    if (noAcumulables.length > 0) {
      const mejorNoAcumulable = noAcumulables.reduce((mejor, actual) =>
        actual.descuento > mejor.descuento ? actual : mejor,
      )
      return [mejorNoAcumulable]
    }

    // Si solo hay acumulables, devolver todas
    return acumulables
  }, [promocionesDetectadas])

  // Calcular descuento total
  const descuentoTotal = useMemo(() => {
    return promocionesAplicables.reduce((total, promo) => total + promo.descuento, 0)
  }, [promocionesAplicables])

  return {
    promocionesDetectadas,
    promocionesAplicables,
    mejorPromocion: promocionesAplicables[0] || null,
    descuentoTotal,
  }
}
