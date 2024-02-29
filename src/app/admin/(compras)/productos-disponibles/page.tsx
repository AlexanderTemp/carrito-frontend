'use client'

import { useEffect, useState } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import { Box, Grid } from '@mui/material'
import { InterpreteMensajes, siteName } from '@/utils'

import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { usePathname } from 'next/navigation'

import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { BotonBuscar } from '@/components/botones/BotonBuscar'

import CardProduct from './ui/CardProduct'
import { Carrito, Producto, ProductoCarrito } from './types/carritoTypes'
import CarritoDrawer from './ui/Carrito'
import { useCart } from '@/context/CartProvider'

export default function ProductosDisponiblesPage() {
  const {
    cartEstado,
    closeCartDrawer,
    activeEstado,
    deactiveEstado,
    cartContent,
    addNuevoProducto,
  } = useCart()
  const [carritoData, setCarritoData] = useState<Carrito>({
    estado: false,
    productos: [],
  })

  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  const { sesionPeticion } = useSession()
  const { permisoUsuario } = useAuth()

  const [filtroProducto, setFiltroProducto] = useState<string>('')
  const [mostrarFiltroProductos, setMostrarFiltroProductos] = useState(false)

  // router para conocr la ruta actual
  const pathname = usePathname()
  const obtenerProductosPeticion = async () => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/productos/all`,
      })
      const productosCarrito: Producto[] = []
      for (const prod of respuesta.datos[0]) {
        productosCarrito.push({
          ...prod,
          cantidad: 0,
        })
      }
      setCarritoData({
        ...carritoData,
        productos: productosCarrito,
      })
    } catch (e) {
      imprimir(`Error al obtener productos`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const reiniciarCarrito = () => {
    setCarritoData((prevState) => ({
      estado: false,
      productos: prevState.productos.map((elem) => ({
        ...elem,
        cantidad: 0,
      })),
    }))

    closeCartDrawer()

    obtenerProductosPeticion()
  }

  useEffect(() => {
    obtenerProductosPeticion().finally(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroProducto])

  useEffect(() => {
    if (!mostrarFiltroProductos) {
      setFiltroProducto('')
    }
  }, [mostrarFiltroProductos])

  const eliminarProductoCarrito = (id: number) => {
    setCarritoData((prevCarritoData) => {
      const modifiedProducto = prevCarritoData.productos.map((modProd) => {
        if (modProd.id === id) {
          return { ...modProd, cantidad: 0 }
        }
        return modProd
      })

      return {
        estado: modifiedProducto.some((prod) => prod.cantidad > 0),
        productos: modifiedProducto,
      }
    })
  }

  const agregarProductoAlCarrito = (producto: Producto) => {
    const productoAlCarrito: ProductoCarrito = {
      cantidad: 1,
      codigoProducto: producto.codigoProducto,
      nombreProducto: producto.nombreProducto,
      precio: producto.precio,
      imagen: producto.imagen,
      id: producto.id,
    }
    addNuevoProducto(productoAlCarrito)
  }

  const accionAgregarProducto = (id: number) => {
    setCarritoData((prevCarritoData) => {
      const modifiedProducto = prevCarritoData.productos.map((modProd) => {
        if (
          modProd.id === id &&
          modProd.cantidad < modProd.cantidadDisponible
        ) {
          agregarProductoAlCarrito({
            ...modProd,
            cantidad: modProd.cantidad + 1,
          })
          return { ...modProd, cantidad: modProd.cantidad + 1 }
        }
        return modProd
      })

      return {
        estado: modifiedProducto.some((prod) => prod.cantidad > 0),
        productos: modifiedProducto,
      }
    })
  }
  useEffect(() => {
    if (carritoData.estado) {
      activeEstado()
    } else {
      deactiveEstado()
    }
  }, [carritoData, setCarritoData])

  const accionQuitarProducto = (id: number) => {
    setCarritoData((prevCarritoData) => {
      const modifiedProducto = prevCarritoData.productos.map((modProd) => {
        if (modProd.id === id && modProd.cantidad > 0) {
          return { ...modProd, cantidad: modProd.cantidad - 1 }
        }
        return modProd
      })

      return {
        estado: modifiedProducto.some((prod) => prod.cantidad > 0),
        productos: modifiedProducto,
      }
    })
  }
  return (
    <>
      <title>{`Productos disponibles - ${siteName()}`}</title>
      <Box display="flex" justifyContent="space-between" paddingBottom={3}>
        <BotonBuscar
          id={'accionFiltrarProductosToggle'}
          key={'accionFiltrarProductosToggle'}
          seleccionado={mostrarFiltroProductos}
          cambiar={setMostrarFiltroProductos}
        />

        <Grid gap={2}>
          <IconoTooltip
            id={'actualizarProducto'}
            titulo={'Actualizar'}
            key={`accionActualizarProducto`}
            accion={async () => {
              await obtenerProductosPeticion()
            }}
            icono={'refresh'}
            name={'Actualizar lista de productos'}
          />
        </Grid>
      </Box>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 2, sm: 8, md: 12 }}
      >
        {carritoData.productos.map((prod) => (
          <Grid
            item
            xs={2}
            sm={4}
            md={4}
            key={`key-${prod.id}-${prod.codigoProducto}`}
          >
            <CardProduct
              producto={prod}
              accionAumentar={accionAgregarProducto}
              accionDisminuir={accionQuitarProducto}
            />
          </Grid>
        ))}
      </Grid>
      <Box height={'40px'} />

      {/*
        <CarritoDrawer
        reiniciarCarrito={reiniciarCarrito}
        carrito={carritoData}
        quitarProducto={eliminarProductoCarrito}
        />        
        */}
    </>
  )
}
