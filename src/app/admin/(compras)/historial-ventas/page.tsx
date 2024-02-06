'use client'
'use client'
import Typography from '@mui/material/Typography'
import { ReactNode, useEffect, useState } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material'
import { delay, InterpreteMensajes, siteName } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { usePathname } from 'next/navigation'
import { CriterioOrdenType } from '@/types/ordenTypes'
import CustomMensajeEstado from '@/components/estados/CustomMensajeEstado'
import { IconoTooltip } from '@/components/botones/IconoTooltip'
import { BotonBuscar } from '@/components/botones/BotonBuscar'
import { BotonOrdenar } from '@/components/botones/BotonOrdenar'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { ordenFiltrado } from '@/utils/orden'
import { Paginacion } from '@/components/datatable/Paginacion'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'
import { VentaCRUDType } from './types/historialCRUDType'
import { FormInputDropdown } from '@/components/form'

export default function HistorialVentasPage() {
  const [ventasData, setVentasData] = useState<VentaCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorVentasData, setErrorVentasData] = useState<any>()

  const [modalVenta, setModalVenta] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoVenta, setMostrarAlertaEstadoVenta] =
    useState(false)

  const [ventaEdicion, setVentaEdicion] = useState<
    VentaCRUDType | undefined | null
  >()

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

  /// Método que muestra alerta de cambio de estado

  const editarEstadoVentaModal = (venta: VentaCRUDType) => {
    setVentaEdicion(venta) // para mostrar datos de modal en la alerta
    setMostrarAlertaEstadoVenta(true) // para mostrar alerta de venta
  }

  const cancelarAlertaEstadoVenta = async () => {
    setMostrarAlertaEstadoVenta(false)
    await delay(500) // para no mostrar undefined mientras el modal se cierra
    setVentaEdicion(null)
  }

  // router para conocer la ruta actual
  const pathname = usePathname()

  /// Criterios de orden
  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'codigoVenta', nombre: 'Código', ordenar: true },
    { campo: 'costoTotal', nombre: 'Costo', ordenar: true },
    { campo: 'nombreUsuario', nombre: 'Nombres del Usuario', ordenar: true },
    {
      campo: 'apellidosUsuario',
      nombre: 'Apellidos del Usuario',
      ordenar: true,
    },
    { campo: 'producto', nombre: 'Detalle', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'cambiar-estado', nombre: 'Cambiar estado', ordenar: false },
    { campo: 'acciones', nombre: 'Acciones' },
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
        key={`${ventaData.idVenta}-${indexVenta}-nombre-usuario`}
        variant={'body2'}
      >
        {`${ventaData.nombreUsuario}`}
      </Typography>,

      <Typography
        key={`${ventaData.idVenta}-${indexVenta}-apellido-usuario`}
        variant={'body2'}
      >
        {`${ventaData.apellidosUsuario}`}
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
            {`${elem.nombreProducto} - [${elem.cantidad} x ${elem.precio} Bs.]`}
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
                : 'primary'
        }
      />,
      <select key={`${ventaData.idVenta}-${indexVenta}-cambio`}>
        <option value="PENDIENTE">PENDIENTE</option>
        <option value="ENVIADO">ENVIADO</option>
        <option value="ENTREGADO">ENTREGADO</option>
        <option value="CANCELADO">CANCELADO</option>
      </select>,
      <Grid key={`${ventaData.idVenta}-${indexVenta}-acciones`}>
        {permisos.update && (
          <IconoTooltip
            id={`cambiarEstadoVenta-${ventaData.idVenta}`}
            titulo={ventaData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
            color={ventaData.estado == 'ACTIVO' ? 'success' : 'error'}
            accion={async () => {
              await editarEstadoVentaModal(ventaData)
            }}
            desactivado={ventaData.estado == 'PENDIENTE'}
            icono={ventaData.estado == 'ACTIVO' ? 'toggle_on' : 'toggle_off'}
            name={
              ventaData.estado == 'ACTIVO'
                ? 'Inactivar Parámetro'
                : 'Activar Parámetro'
            }
          />
        )}

        {permisos.update && (
          <IconoTooltip
            id={`editarVentas-${ventaData.idVenta}`}
            name={'Ventas'}
            titulo={'Editar'}
            color={'primary'}
            accion={() => {
              imprimir(`Editaremos`, ventaData)
              editarVentaModal(ventaData)
            }}
            icono={'edit'}
          />
        )}
      </Grid>,
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
    permisos.create && (
      <IconoBoton
        id={'agregarVenta'}
        key={'agregarVenta'}
        texto={'Agregar'}
        variante={xs ? 'icono' : 'boton'}
        icono={'add_circle_outline'}
        descripcion={'Agregar venta'}
        accion={() => {
          agregarVentaModal()
        }}
      />
    ),
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

  const agregarVentaModal = () => {
    setVentaEdicion(undefined)
    setModalVenta(true)
  }
  const editarVentaModal = (venta: VentaCRUDType) => {
    setVentaEdicion(venta)
    setModalVenta(true)
  }

  const cerrarModalVenta = async () => {
    setModalVenta(false)
    await delay(500)
    setVentaEdicion(undefined)
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
