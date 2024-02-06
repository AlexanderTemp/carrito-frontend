import React, { useState } from 'react'
import { Carrito } from '../types/carritoTypes'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Drawer,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { imprimir } from '@/utils/imprimir'
import { Constantes } from '@/config/Constantes'
import { InterpreteMensajes, delay } from '@/utils'
import { useAlerts, useSession } from '@/hooks'
import ProgresoLineal from '@/components/progreso/ProgresoLineal'

interface Props {
  carrito: Carrito
  openCarrito: boolean
  cerrarCarrito: () => void
  reiniciarCarrito: () => void
}

interface EnviarDetalle {
  idProducto: number
  cantidad: number
  costo: number
}

const CarritoDrawer = ({
  carrito,
  openCarrito,
  reiniciarCarrito,
  cerrarCarrito,
}: Props) => {
  const [loadingCompra, setLoadingCompra] = useState<boolean>(false)

  const theme = useTheme()
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  let total = 0
  for (const prod of carrito.productos) {
    total += prod.cantidad * prod.precio
  }

  const realizarVenta = async () => {
    try {
      setLoadingCompra(true)
      await delay(1000)

      const ventas: EnviarDetalle[] = carrito.productos.map((elem) => {
        return {
          idProducto: elem.id,
          cantidad: elem.cantidad,
          costo: elem.precio,
        }
      })

      imprimir(ventas)

      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/ventas`,
        tipo: 'post',
        body: { ventas },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
    } catch (e) {
      imprimir(`Error al crear o actualizar parámetro`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingCompra(false)
      reiniciarCarrito()
    }
  }

  return (
    <Drawer
      anchor="right"
      onClose={cerrarCarrito}
      open={openCarrito}
      PaperProps={{
        sx: { width: 280, paddingTop: 8 },
      }}
    >
      <Grid container spacing={3} sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Box display="flex" gap={1}>
            <Typography variant="body1">Resumen de Orden</Typography>
            <Typography sx={{ color: theme.palette.primary.main }}>
              #343253
            </Typography>
          </Box>
        </Grid>
        <Divider />
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="row"
            marginBottom={2}
            gap={2}
          >
            <Typography
              variant="body1"
              sx={{ color: theme.palette.primary.main }}
            >
              Detalle venta
            </Typography>
          </Box>
          <Grid container spacing={1}>
            {carrito.productos.map((elem) => (
              <Grid
                key={`sub-product-${elem.id}-${elem.nombreProducto}`}
                item
                xs={12}
              >
                {elem.cantidad > 0 && (
                  <Card sx={{ borderColor: theme.palette.secondary.main }}>
                    {elem.imagen && elem.imagen.length > 0 ? (
                      <CardMedia
                        component="img"
                        height={70}
                        width={40}
                        image={elem.imagen}
                        alt={`producto-cart-${elem.id}-${elem.nombreProducto}`}
                      />
                    ) : (
                      <Avatar>No Image</Avatar>
                    )}
                    <CardContent>
                      <Grid>
                        <Typography variant="body2">
                          {elem.nombreProducto}
                        </Typography>
                        <Typography sx={{ color: theme.palette.primary.main }}>
                          {`${elem.cantidad} c/u (${elem.precio} Bs.)`}
                        </Typography>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Divider />
        <Grid item xs={12} gap={3}>
          <Box display="flex" gap={1} alignItems="center">
            <Typography>Costo total</Typography>
            <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
              {total} Bs.
            </Typography>
          </Box>

          <Box height={'10px'} />
          <Button variant="contained" onClick={() => realizarVenta()} fullWidth>
            Comprar
          </Button>
          <Box height={'10px'} />
          <ProgresoLineal mostrar={loadingCompra} />
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default CarritoDrawer
