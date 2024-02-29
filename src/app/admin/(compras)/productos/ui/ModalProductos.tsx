import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CrearEditarProductoCRUDType,
  ProductoCRUDType,
} from '../types/productosCRUDTypes'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { FormInputText } from 'src/components/form'
import ProgresoLineal from '@/components/progreso/ProgresoLineal'
import FormInputFile from '@/components/form/FormInputFile'

export interface ModalProductoType {
  producto?: ProductoCRUDType | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalProducto = ({
  producto,
  accionCorrecta,
  accionCancelar,
}: ModalProductoType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarProductoCRUDType>({
    defaultValues: {
      id: producto?.id,
      codigoProducto: producto?.codigoProducto,
      descripcion: producto?.descripcion,
      nombreProducto: producto?.nombreProducto,
      cantidadDisponible: producto?.cantidadDisponible,
      imagen: producto?.imagen,
      precio: producto?.precio,
    },
  })

  const guardarActualizarProducto = async (
    data: CrearEditarProductoCRUDType
  ) => {
    await guardarActualizarProductosPeticion(data)
  }

  const guardarActualizarProductosPeticion = async (
    producto: CrearEditarProductoCRUDType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)

      const dataSend: FormData = new FormData()
      dataSend.set('codigoProducto', producto.codigoProducto)
      dataSend.set('nombreProducto', producto.nombreProducto)
      dataSend.set('descripcion', producto.descripcion)
      dataSend.set('precio', String(Number(producto.precio)))
      dataSend.set(
        'cantidadDisponible',
        String(Number(producto.cantidadDisponible))
      )
      // @ts-ignore
      dataSend.set('imagen', producto.imagen[0])

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/productos${
          producto.id ? `/${producto.id}` : ''
        }`,
        tipo: !!producto.id ? 'patch' : 'post',
        body: dataSend,
      })

      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar parámetro`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(guardarActualizarProducto)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'codigoProducto'}
                control={control}
                name="codigoProducto"
                label="Código"
                disabled={
                  (producto?.id !== null || producto?.id !== undefined) &&
                  loadingModal
                }
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'nombreProducto'}
                control={control}
                name="nombreProducto"
                label="Nombre"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'descripcion'}
                control={control}
                name="descripcion"
                label="Decripción"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>

          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'precio'}
                control={control}
                type={'number'}
                name="precio"
                label="Precio"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'cantidadDisponible'}
                control={control}
                name="cantidadDisponible"
                type={'number'}
                label="Cantidad"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>

          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={12}>
              <FormInputFile
                id="imagen"
                control={control}
                name="imagen"
                label="Imagen"
                limite={1}
              />
            </Grid>
          </Grid>

          <Box height={'10px'} />
          <ProgresoLineal mostrar={loadingModal} />
          <Box height={'5px'} />
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          my: 1,
          mx: 2,
          justifyContent: {
            lg: 'flex-end',
            md: 'flex-end',
            xs: 'center',
            sm: 'center',
          },
        }}
      >
        <Button
          variant={'outlined'}
          disabled={loadingModal}
          onClick={accionCancelar}
        >
          Cancelar
        </Button>
        <Button variant={'contained'} disabled={loadingModal} type={'submit'}>
          Guardar
        </Button>
      </DialogActions>
    </form>
  )
}
