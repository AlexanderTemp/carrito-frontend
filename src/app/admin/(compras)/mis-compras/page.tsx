'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import { useTheme, useMediaQuery, Typography, Box } from '@mui/material'
import { delay, siteName } from '@/utils'
import { imprimir } from '@/utils/imprimir'
import { usePathname } from 'next/navigation'
import { InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { Paginacion } from '@/components/datatable/Paginacion'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { CriterioOrdenType } from '@/types/ordenTypes'
import { ComprasCRUDType } from './types/comprasCRUDTypes'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'

const MisComprasPage = () => {
  const [comprasData, setcomprasData] = useState<ComprasCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorcomprasData, setErrorcomprasData] = useState<any>()

  const [modalCompras, setModalCompras] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoCompras, setMostrarAlertaEstadoCompras] =
    useState(false)

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const { sesionPeticion } = useSession()
  const { permisoUsuario } = useAuth()

  const [filtroCompras, setFiltroCompras] = useState<string>('')
  const [mostrarFiltrocompras, setMostrarFiltrocompras] = useState(false)
  // Permisos para acciones
  const [permisos, setPermisos] = useState<CasbinTypes>({
    read: false,
    create: false,
    update: false,
    delete: false,
  })

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  // router para conocer la ruta actual
  const pathname = usePathname()

  /// Criterios de orden
  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'codigoVenta', nombre: 'Código venta', ordenar: true },
    { campo: 'totalVenta', nombre: 'Costo total', ordenar: true },
    { campo: 'detalle', nombre: 'Detalle venta', ordenar: true },
    { campo: 'estado', nombre: 'Estado actual', ordenar: true },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = comprasData.map(
    (ComprasData, indexCompras) => [
      <Typography
        key={`${ComprasData.idVenta}-${indexCompras}-codigo`}
        variant={'body2'}
      >{`${ComprasData.codigoVenta}`}</Typography>,
      <Typography
        key={`${ComprasData.idVenta}-${indexCompras}-nombre`}
        variant={'body2'}
      >
        {`${ComprasData.totalVenta}`}
      </Typography>,

      <Box
        display="flex"
        flexDirection="column"
        key={`${ComprasData.idVenta}-${indexCompras}-descripcion`}
      >
        {ComprasData.productos.map((elem) => {
          return (
            <Typography key={`prod-${elem.idProducto}`}>
              - {elem.nombreProducto} - [{elem.cantidad} x {elem.precio}]
            </Typography>
          )
        })}
      </Box>,

      <CustomMensajeEstado
        key={`${ComprasData.idVenta}-${indexCompras}-estado`}
        titulo={ComprasData.estado}
        descripcion={ComprasData.estado}
        color={
          ComprasData.estado === 'ENTREGADO'
            ? 'success'
            : ComprasData.estado == 'CANCELADO'
              ? 'error'
              : ComprasData.estado == 'PENDIENTE'
                ? 'warning'
                : 'info'
        }
      />,
    ]
  )

  const acciones: Array<ReactNode> = [
    <IconoTooltip
      id={'actualizarCompras'}
      titulo={'Actualizar'}
      key={`accionActualizarCompras`}
      accion={async () => {
        await obtenerComprasPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de compras'}
    />,
  ]

  const obtenerComprasPeticion = async () => {
    try {
      setLoading(true)

      delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/ventas`,
      })

      setcomprasData(respuesta.datos)
      // setcomprasData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorcomprasData(null)
    } catch (e) {
      imprimir(`Error al obtener compras`, e)
      setErrorcomprasData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function definirPermisos() {
    setPermisos(await permisoUsuario(pathname))
  }

  useEffect(() => {
    definirPermisos().finally()
    obtenerComprasPeticion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mostrarFiltrocompras) {
      setFiltroCompras('')
    }
  }, [mostrarFiltrocompras])

  const paginacion = (
    <Paginacion
      pagina={pagina}
      limite={limite}
      total={total}
      cambioPagina={setPagina}
      cambioLimite={setLimite}
    />
  )

  return (
    <>
      <title>{`Mis compras - ${siteName()}`}</title>
      <CustomDataTable
        titulo={'Mis compras'}
        error={!!errorcomprasData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        paginacion={paginacion}
        contenidoTabla={contenidoTabla}
        filtros={[]}
      />
    </>
  )
}

export default MisComprasPage
