import React, { useState, useRef } from 'react'
import { Carrito, Producto } from '../types/carritoTypes'
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
import { useCart } from '@/context/CartProvider'

interface Props {
  carrito: Carrito
  reiniciarCarrito: () => void
  quitarProducto: (id: number) => void
}

interface EnviarDetalle {
  idProducto: number
  cantidad: number
  costo: number
}

const CarritoDrawer = ({
  carrito,
  reiniciarCarrito,
  quitarProducto,
}: Props) => {
  const { cartOpen, closeCartDrawer } = useCart()

  const dataForCart: Producto[] = carrito.productos.filter(
    (elem) => elem.cantidad > 0
  )

  let total = 0
  for (const prod of carrito.productos) {
    if (prod.cantidad > 0) {
      total += prod.cantidad * prod.precio
    }
  }

  const [loadingCompra, setLoadingCompra] = useState<boolean>(false)

  const theme = useTheme()
  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

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
      onClose={closeCartDrawer}
      open={cartOpen}
      PaperProps={{
        sx: { width: 300, paddingTop: 8 },
      }}
    >
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={12}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <Typography variant="h6">Resumen de Orden</Typography>
          </Box>
        </Grid>
        <Divider />
        <Grid item xs={12}>
          <Box
            gap={1}
            marginTop={2}
            display="flex"
            flexDirection="column"
            width="100%"
          >
            {dataForCart.map((elem) => (
              <Card
                key={`sub-product-${elem.id}-${elem.nombreProducto}`}
                sx={{
                  display: 'flex',
                  border: 1,
                  borderColor: theme.palette.primary.main,
                  flexDirection: 'row',
                  width: 'full',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: '45px', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                  image={`${Constantes.baseUrl.replaceAll('/api', '')}/${elem.imagen}`}
                  alt={`producto-cart-${elem.id}-${elem.nombreProducto}`}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography
                      color={theme.palette.primary.main}
                      fontWeight="semibold"
                      component="div"
                      variant="body1"
                    >
                      {elem.nombreProducto}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      component="div"
                    >
                      {` ${elem.cantidad} unidades`}
                    </Typography>
                    <Box
                      display="flex"
                      width="100%"
                      justifyContent="space-between"
                      alignItems="baseline"
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.main"
                        component="div"
                      >
                        {`Costo ${elem.precio * elem.cantidad} Bs.`}
                      </Typography>
                      <Button onClick={() => quitarProducto(elem.id)}>
                        <Typography
                          variant="subtitle2"
                          color="text.main"
                          component="div"
                        >
                          Eliminar
                        </Typography>
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            ))}
          </Box>
        </Grid>
        <Divider />
        <Grid item xs={12} gap={3}>
          <Box
            display="flex"
            width="full"
            flexDirection="row"
            justifyContent="space-between"
            gap={1}
            paddingX={1}
            alignItems="center"
          >
            <Typography variant="h5">Total</Typography>
            <Typography variant="h5" sx={{ color: theme.palette.primary.main }}>
              {total} Bs.
            </Typography>
          </Box>

          <Box height={'10px'} />
          <ProgresoLineal mostrar={loadingCompra} />
          <Button
            variant={loadingCompra ? 'outlined' : 'contained'}
            disabled={loadingCompra ? true : false}
            onClick={() => realizarVenta()}
            fullWidth
          >
            Comprar
          </Button>
          <Box height={'10px'} />
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default CarritoDrawer
