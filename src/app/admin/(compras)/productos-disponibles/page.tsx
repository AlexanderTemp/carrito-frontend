'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import { Box, Grid, useTheme } from '@mui/material'
import { siteName } from '@/utils'

import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { usePathname } from 'next/navigation'

import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { BotonBuscar } from '@/components/botones/BotonBuscar'

import { Paginacion } from '@/components/datatable/Paginacion'

import CardProduct from './ui/CardProduct'
import { Carrito, Producto } from './types/carritoTypes'
import CarritoDrawer from './ui/Carrito'

export default function ProductosDisponiblesPage() {
  const theme = useTheme()

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
  // Permisos para acciones
  const [permisos, setPermisos] = useState<CasbinTypes>({
    read: false,
    create: false,
    update: false,
    delete: false,
  })

  // router para conocr la ruta actual
  const pathname = usePathname()

  const [clickCarrito, setClickCarrito] = useState(false)

  const obtenerProductosPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/productos`,
      })

      //setProductosData(respuesta.datos[0])
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

      // setProductosData(respuesta.datos?.filas)
      //setErrorProductosData(null)
    } catch (e) {
      imprimir(`Error al obtener productos`, e)
      //setErrorProductosData(e)
      //Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function definirPermisos() {
    setPermisos(await permisoUsuario(pathname))
  }

  useEffect(() => {
    definirPermisos().finally()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    obtenerProductosPeticion().finally(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filtroProducto,
  ])

  useEffect(() => {
    if (!mostrarFiltroProductos) {
      setFiltroProducto('')
    }
  }, [mostrarFiltroProductos])

  const accionAgregarProducto = (id: number) => {
    setCarritoData((prevCarritoData) => {
      const modifiedProducto = prevCarritoData.productos.map((modProd) => {
        if (
          modProd.id === id &&
          modProd.cantidad < modProd.cantidadDisponible
        ) {
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
  useEffect(() => {}, [carritoData, setCarritoData])

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
          <IconoTooltip
            color={carritoData.estado ? 'primary' : 'disabled'}
            id={'carritoProductos'}
            titulo={'Carrito'}
            key={`accionVerCarrito`}
            accion={() => {
              if (carritoData.estado) setClickCarrito(true)
            }}
            icono={'shopping_cart'}
            name={'Ver total del carrito'}
          />
        </Grid>
      </Box>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
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
      <CarritoDrawer
        carrito={carritoData}
        cerrarCarrito={() => setClickCarrito(false)}
        openCarrito={clickCarrito}
      />
    </>
  )
}
