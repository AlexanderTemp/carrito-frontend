import React, { useEffect } from 'react'
import { ProductoCRUDType } from '../../productos/types/productosCRUDTypes'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Collapse,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { IconoBoton } from '@/components/botones/IconoBoton'
import { Producto } from '../types/carritoTypes'

interface Props {
  producto: Producto
  accionAumentar: Function
  accionDisminuir: Function
}

const CardProduct = ({ producto, accionAumentar, accionDisminuir }: Props) => {
  const theme = useTheme()

  const [expanded, setExpanded] = React.useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <Card
      sx={{
        border: 2,
        borderColor:
          producto.cantidad > 0
            ? theme.palette.primary.main
            : theme.palette.background.paper,
      }}
    >
      {producto.imagen && producto.imagen.length > 0 ? (
        <CardMedia
          component="img"
          height={200}
          image={producto.imagen}
          alt={`producto-${producto.id}-${producto.nombreProducto}`}
        />
      ) : (
        <Avatar>No Image</Avatar>
      )}
      <CardContent>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">{producto.nombreProducto}</Typography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.primary.main }}
            >
              {producto.precio} Bs.
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.primary.main }}
            >
              (Max. {producto.cantidadDisponible})
            </Typography>
          </Box>
        </Box>

        <Grid
          container
          sx={{
            paddingY: 2,
          }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography>Descripción</Typography>
          <IconoBoton
            variante="icono"
            id="IconoMas"
            descripcion="Icono para ver la descripción"
            icono="expand_more"
            texto="Expandir más"
            accion={handleExpandClick}
          />
        </Grid>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography>{producto.descripcion}</Typography>
          </CardContent>
        </Collapse>

        <Grid container>
          {producto.cantidad === 0 ? (
            <Button
              fullWidth
              onClick={() => accionAumentar(producto.id)}
              variant="outlined"
            >
              Agregar
            </Button>
          ) : (
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ width: '100%' }}
            >
              <Button variant="outlined" disabled>
                Seleccionado
              </Button>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
              >
                <IconoBoton
                  accion={() => accionDisminuir(producto.id)}
                  icono="remove"
                  descripcion=""
                  variant="outlined"
                  variante="icono"
                  id="add_producto"
                  texto="Quitar"
                />
                <Typography>{producto.cantidad}</Typography>
                <IconoBoton
                  variant="contained"
                  accion={() => accionAumentar(producto.id)}
                  icono="add"
                  variante="icono"
                  descripcion=""
                  id="add_producto"
                  texto="Agregar"
                />
              </Box>
            </Box>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardProduct
