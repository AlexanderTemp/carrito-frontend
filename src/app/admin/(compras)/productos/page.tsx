'use client'
import Typography from '@mui/material/Typography'
import { ReactNode, useEffect, useState } from 'react'
import { useAlerts, useSession } from '@/hooks'
import { useAuth } from '@/context/AuthProvider'
import { CasbinTypes } from '@/types'
import {
  Avatar,
  Button,
  Card,
  CardMedia,
  Grid,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { delay, InterpreteMensajes, siteName, titleCase } from '@/utils'
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
import { AlertDialog } from '@/components/modales/AlertDialog'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { CustomDataTable } from '@/components/datatable/CustomDataTable'

import { FiltroProductos } from './ui/FiltroProductos'
import { VistaModalProducto } from './ui'
import { ProductoCRUDType } from './types/productosCRUDTypes'

export default function ProductosPage() {
  const [productosData, setProductosData] = useState<ProductoCRUDType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()
  const [errorProductosData, setErrorProductosData] = useState<any>()

  const [modalProducto, setModalProducto] = useState(false)

  /// Indicador para mostrar una vista de alerta de cambio de estado
  const [mostrarAlertaEstadoProducto, setMostrarAlertaEstadoProducto] =
    useState(false)

  const [productoEdicion, setProductoEdicion] = useState<
    ProductoCRUDType | undefined | null
  >()

  // Variables de páginado
  const [limite, setLimite] = useState<number>(10)
  const [pagina, setPagina] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

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

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  /// Método que muestra alerta de cambio de estado

  const editarEstadoProductoModal = (producto: ProductoCRUDType) => {
    setProductoEdicion(producto) // para mostrar datos de modal en la alerta
    setMostrarAlertaEstadoProducto(true) // para mostrar alerta de producto
  }

  const cancelarAlertaEstadoProducto = async () => {
    setMostrarAlertaEstadoProducto(false)
    await delay(500) // para no mostrar undefined mientras el modal se cierra
    setProductoEdicion(null)
  }

  /// Método que oculta la alerta de cambio de estado y procede
  const aceptarAlertaEstadoProducto = async () => {
    setMostrarAlertaEstadoProducto(false)
    if (productoEdicion) {
      await cambiarEstadoProductoPeticion(productoEdicion)
    }
    setProductoEdicion(null)
  }

  /// Petición que cambia el estado de un producto
  const cambiarEstadoProductoPeticion = async (producto: ProductoCRUDType) => {
    try {
      setLoading(true)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/productos/${producto.id}/${
          producto.estado == 'ACTIVO' ? 'inactivacion' : 'activacion'
        }`,
        tipo: 'patch',
      })
      imprimir(`respuesta estado producto: ${respuesta}`)
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      await obtenerProductosPeticion()
    } catch (e) {
      imprimir(`Error estado producto`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // router para conocer la ruta actual
  const pathname = usePathname()

  /// Criterios de orden
  const [ordenCriterios, setOrdenCriterios] = useState<
    Array<CriterioOrdenType>
  >([
    { campo: 'codigo', nombre: 'Código', ordenar: true },
    { campo: 'nombre', nombre: 'Nombre', ordenar: true },
    { campo: 'descripcion', nombre: 'Descripción', ordenar: true },
    { campo: 'imagen', nombre: 'Imagen opcional', ordenar: true },
    { campo: 'precio', nombre: 'Precio unidad', ordenar: true },
    { campo: 'cantidadDisponible', nombre: 'Stock actual', ordenar: true },
    { campo: 'estado', nombre: 'Estado', ordenar: true },
    { campo: 'acciones', nombre: 'Acciones' },
  ])

  const contenidoTabla: Array<Array<ReactNode>> = productosData.map(
    (productoData, indexProducto) => [
      <Typography
        key={`${productoData.id}-${indexProducto}-codigo`}
        variant={'body2'}
      >{`${productoData.codigoProducto}`}</Typography>,
      <Typography
        key={`${productoData.id}-${indexProducto}-nombre`}
        variant={'body2'}
      >
        {`${productoData.nombreProducto}`}
      </Typography>,

      <Tooltip
        sx={{ cursor: 'pointer', hover: theme.palette.background.default }}
        key={`${productoData.id}-${indexProducto}-descripcion`}
        title={productoData.descripcion}
      >
        <Typography
          variant={'body2'}
        >{`${productoData.descripcion.substring(0, 25)}...`}</Typography>
      </Tooltip>,

      <Card
        key={`${productoData.id}-${indexProducto}-imageUrl`}
        sx={{ maxWidth: 150 }}
      >
        {productoData.imagen && productoData.imagen.length > 0 ? (
          <CardMedia
            component="img"
            height="120"
            image={productoData.imagen}
            alt={`image-${productoData.nombreProducto}`}
          />
        ) : (
          <Avatar>No IMG</Avatar>
        )}
      </Card>,

      <Typography
        key={`${productoData.id}-${indexProducto}-precio`}
        variant={'body2'}
      >{`${productoData.precio}`}</Typography>,

      <Typography
        key={`${productoData.id}-${indexProducto}-cantidadDisponible`}
        variant={'body2'}
      >{`${productoData.cantidadDisponible}`}</Typography>,

      <CustomMensajeEstado
        key={`${productoData.id}-${indexProducto}-estado`}
        titulo={productoData.estado}
        descripcion={productoData.estado}
        color={
          productoData.estado == 'ACTIVO'
            ? 'success'
            : productoData.estado == 'INACTIVO'
              ? 'error'
              : 'info'
        }
      />,

      <Grid key={`${productoData.id}-${indexProducto}-acciones`}>
        {permisos.update && (
          <IconoTooltip
            id={`cambiarEstadoProducto-${productoData.id}`}
            titulo={productoData.estado == 'ACTIVO' ? 'Inactivar' : 'Activar'}
            color={productoData.estado == 'ACTIVO' ? 'success' : 'error'}
            accion={async () => {
              await editarEstadoProductoModal(productoData)
            }}
            desactivado={productoData.estado == 'PENDIENTE'}
            icono={productoData.estado == 'ACTIVO' ? 'toggle_on' : 'toggle_off'}
            name={
              productoData.estado == 'ACTIVO'
                ? 'Inactivar Parámetro'
                : 'Activar Parámetro'
            }
          />
        )}

        {permisos.update && (
          <IconoTooltip
            id={`editarProductos-${productoData.id}`}
            name={'Productos'}
            titulo={'Editar'}
            color={'primary'}
            accion={() => {
              imprimir(`Editaremos`, productoData)
              editarProductoModal(productoData)
            }}
            icono={'edit'}
          />
        )}
      </Grid>,
    ]
  )

  const acciones: Array<ReactNode> = [
    <BotonBuscar
      id={'accionFiltrarProductosToggle'}
      key={'accionFiltrarProductosToggle'}
      seleccionado={mostrarFiltroProductos}
      cambiar={setMostrarFiltroProductos}
    />,
    xs && (
      <BotonOrdenar
        id={'ordenarProductos'}
        key={`ordenarProductos`}
        label={'Ordenar productos'}
        criterios={ordenCriterios}
        cambioCriterios={setOrdenCriterios}
      />
    ),
    <IconoTooltip
      id={'actualizarProducto'}
      titulo={'Actualizar'}
      key={`accionActualizarProducto`}
      accion={async () => {
        await obtenerProductosPeticion()
      }}
      icono={'refresh'}
      name={'Actualizar lista de productos'}
    />,
    permisos.create && (
      <IconoBoton
        id={'agregarProducto'}
        key={'agregarProducto'}
        texto={'Agregar'}
        variante={xs ? 'icono' : 'boton'}
        icono={'add_circle_outline'}
        descripcion={'Agregar producto'}
        accion={() => {
          agregarProductoModal()
        }}
      />
    ),
  ]

  const obtenerProductosPeticion = async () => {
    try {
      setLoading(true)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/productos`,
        params: {
          pagina: pagina,
          limite: limite,
          ...(filtroProducto.length == 0 ? {} : { filtro: filtroProducto }),
          ...(ordenFiltrado(ordenCriterios).length == 0
            ? {}
            : {
                orden: ordenFiltrado(ordenCriterios).join(','),
              }),
        },
      })

      console.log(respuesta)

      setProductosData(respuesta.datos[0])

      // setProductosData(respuesta.datos?.filas)
      setTotal(respuesta.datos?.total)
      setErrorProductosData(null)
    } catch (e) {
      imprimir(`Error al obtener productos`, e)
      setErrorProductosData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const agregarProductoModal = () => {
    setProductoEdicion(undefined)
    setModalProducto(true)
  }
  const editarProductoModal = (producto: ProductoCRUDType) => {
    setProductoEdicion(producto)
    setModalProducto(true)
  }

  const cerrarModalProducto = async () => {
    setModalProducto(false)
    await delay(500)
    setProductoEdicion(undefined)
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
    pagina,
    limite,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(ordenCriterios),
    filtroProducto,
  ])

  useEffect(() => {
    if (!mostrarFiltroProductos) {
      setFiltroProducto('')
    }
  }, [mostrarFiltroProductos])

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
      <title>{`Productos - ${siteName()}`}</title>
      <AlertDialog
        isOpen={mostrarAlertaEstadoProducto}
        titulo={'Alerta'}
        texto={`¿Está seguro de ${
          productoEdicion?.estado == 'ACTIVO' ? 'inactivar' : 'activar'
        } el producto: ${titleCase(productoEdicion?.nombreProducto ?? '')} ?`}
      >
        <Button onClick={cancelarAlertaEstadoProducto}>Cancelar</Button>
        <Button onClick={aceptarAlertaEstadoProducto}>Aceptar</Button>
      </AlertDialog>
      <CustomDialog
        isOpen={modalProducto}
        handleClose={cerrarModalProducto}
        title={productoEdicion ? 'Editar producto' : 'Nuevo producto'}
      >
        <VistaModalProducto
          producto={productoEdicion}
          accionCorrecta={() => {
            cerrarModalProducto().finally()
            obtenerProductosPeticion().finally()
          }}
          accionCancelar={cerrarModalProducto}
        />
      </CustomDialog>
      <CustomDataTable
        titulo={'Productos'}
        error={!!errorProductosData}
        cargando={loading}
        acciones={acciones}
        columnas={ordenCriterios}
        cambioOrdenCriterios={setOrdenCriterios}
        paginacion={paginacion}
        contenidoTabla={contenidoTabla}
        filtros={
          mostrarFiltroProductos && (
            <FiltroProductos
              filtroProducto={filtroProducto}
              accionCorrecta={(filtros) => {
                setPagina(1)
                setLimite(10)
                setFiltroProducto(filtros.producto)
              }}
              accionCerrar={() => {
                imprimir(`👀 cerrar`)
              }}
            />
          )
        }
      />
    </>
  )
}
