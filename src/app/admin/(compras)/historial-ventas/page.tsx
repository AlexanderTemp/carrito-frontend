'use client'
import Typography from '@mui/material/Typography'
import { ReactNode, useEffect, useState } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { delay, InterpreteMensajes, siteName } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { usePathname } from 'next/navigation'
import { CriterioOrdenType } from '@/types/ordenTypes'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { Paginacion } from '@/components/datatable/Paginacion'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import {
  EnvioNuevoEstado,
  EstadoVenta,
  VentaCRUDType,
} from './types/historialCRUDType'
import { FormInputDropdown } from '@/components/form'
import { useForm } from 'react-hook-form'

export default function HistorialVentasPage() {
  const { control } = useForm<EnvioNuevoEstado>({
    defaultValues: {
      id: -1,
      estado: EstadoVenta.PENDIENTE,
    },
  })

  const [ventasData, setVentasData] = useState<VentaCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingCambioEstado, setLoadingCambioEstado] = useState<boolean>(false)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorVentasData, setErrorVentasData] = useState<any>()

  const [modalVenta, setModalVenta] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoVenta, setMostrarAlertaEstadoVenta] =
    useState(false)

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const { sesionPeticion } = useSession()
  const { permisoUsuario } = useAuth()

  const [filtroVenta, setFiltroVenta] = useState<string>('')
  const [mostrarFiltroVentas, setMostrarFiltroVentas] = useState(false)
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
    { campo: 'codigoVenta', nombre: 'Código', ordenar: true },
    { campo: 'costoTotal', nombre: 'Costo', ordenar: true },
    { campo: 'correoUsuario', nombre: 'Correo del Usuario', ordenar: true },
    { campo: 'producto', nombre: 'Detalle', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'cambiar-estado', nombre: 'Cambiar estado', ordenar: false },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = ventasData.map(
    (ventaData, indexVenta) => [
      <Typography
        key={`${ventaData.idVenta}-${indexVenta}-codigo`}
        variant={'body2'}
      >{`${ventaData.codigoVenta}`}</Typography>,

      <Typography
        key={`${ventaData.idVenta}-${indexVenta}-costo-total`}
        variant={'body2'}
      >
        {`${ventaData.totalVenta}`}
      </Typography>,

      <Typography
        key={`${ventaData.idVenta}-${indexVenta}-correo-usuario`}
        variant={'body2'}
      >
        {`${ventaData.correoUsuario}`}
      </Typography>,

      <Box
        display="flex"
        flexDirection="column"
        key={`${ventaData.idVenta}-${indexVenta}-detalle`}
      >
        {ventaData.productos.map((elem, indexProducto) => (
          <Typography
            key={`${elem.idProducto}-${indexProducto}-producto`}
            variant={'body2'}
          >
            {`- ${elem.nombreProducto} - [${elem.cantidad} x ${elem.precio} Bs.]`}
          </Typography>
        ))}
      </Box>,

      <CustomMensajeEstado
        key={`${ventaData.idVenta}-${indexVenta}-estado`}
        titulo={ventaData.estado}
        descripcion={ventaData.estado}
        color={
          ventaData.estado === 'ENTREGADO'
            ? 'success'
            : ventaData.estado == 'CANCELADO'
              ? 'error'
              : ventaData.estado == 'PENDIENTE'
                ? 'warning'
                : 'info'
        }
      />,
      <Box
        key={`${ventaData.idVenta}-${indexVenta}-cambio`}
        sx={{ width: '150px' }}
      >
        <FormInputDropdown
          label=""
          control={{
            ...control,
            _defaultValues: {
              estado: ventaData.estado as EstadoVenta,
            },
          }}
          id="estado"
          name="estado"
          onChange={(event) => {
            actualizarEstadoVenta(ventaData.idVenta, event.target.value)
          }}
          options={[
            {
              key: '1',
              value: 'PENDIENTE',
              label: 'PENDIENTE',
            },
            {
              key: '2',
              value: 'ENVIADO',
              label: 'ENVIADO',
            },
            {
              key: '3',
              value: 'ENTREGADO',
              label: 'ENTREGADO',
            },
            {
              key: '4',
              value: 'CANCELADO',
              label: 'CANCELADO',
            },
          ]}
        />
      </Box>,
    ]
  )

  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarVentasToggle'}
      key={'accionFiltrarVentasToggle'}
      seleccionado={mostrarFiltroVentas}
      cambiar={setMostrarFiltroVentas}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarVentas'}
        key={`ordenarVentas`}
        label={'Ordenar ventas'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),
    <IconoTooltip
      id={'actualizarVenta'}
      titulo={'Actualizar'}
      key={`accionActualizarVenta`}
      accion={async () => {
        await obtenerVentasPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de ventas'}
    />,
  ]

  const obtenerVentasPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/ventas/historico`,
      })

      setVentasData(respuesta.datos)
      // setVentasData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorVentasData(null)
    } catch (e) {
      imprimir(`Error al obtener ventas`, e)
      setErrorVentasData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const actualizarEstadoVenta = async (idVenta: number, estado: string) => {
    try {
      setLoadingCambioEstado(true)
      await delay(1000)

      imprimir(`${idVenta} y ${estado}`)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/ventas/cambio-estado/${idVenta}`,
        tipo: 'patch',
        body: { estado },
      })

      await obtenerVentasPeticion()

      Alerta({
        mensaje: `Actualización de estado existosa.`,
        variant: 'success',
      })
    } catch (e) {
      imprimir(`Error al actualizar la venta`, e)
      setErrorVentasData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingCambioEstado(false)
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
    obtenerVentasPeticion().finally(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagina,
    limite,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(ordenCriterios),
    filtroVenta,
  ])

  useEffect(() => {
    if (!mostrarFiltroVentas) {
      setFiltroVenta('')
    }
  }, [mostrarFiltroVentas])

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
      <title>{`Historico Ventas - ${siteName()}`}</title>
      <CustomDataTable
        titulo={'Historico ventas'}
        error={!!errorVentasData}
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
