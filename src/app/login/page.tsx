'use client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Constantes } from '@/config/Constantes'
import { useEffect } from 'react'
import { imprimir } from '@/utils/imprimir'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import LoginRegistroContainer from '@/app/login/ui/LoginRegistroContainer'

export default function LoginPage() {
  const theme = useTheme()
  const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  useEffect(() => {
    const getEstado = async () => {
      const res = await fetch(`${Constantes.baseUrl}/estado`)
      return res.json()
    }

    getEstado().then((value) => imprimir(value))
  }, [])

  return (
    <Grid container justifyContent="space-evenly" alignItems={'center'}>
      <Grid item xl={6} md={5} xs={12}>
        <Box
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          minHeight={sm || xs ? '30vh' : '80vh'}
          color={'primary'}
        >
          <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Typography
              variant={'h4'}
              component="h1"
              align={sm || xs ? 'center' : 'left'}
            >
              Frontend base con Next.js (App Router), MUI v5 y TypeScript
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        sx={{
          display: {
            sm: 'none',
            xs: 'none',
            md: 'block',
            xl: 'block',
          },
        }}
      >
        <Box
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          minHeight={'80vh'}
        >
          <Divider
            variant={'middle'}
            sx={{ marginTop: '60px', marginBottom: '60px' }}
            orientation="vertical"
            flexItem
          />
        </Box>
      </Grid>
      <Grid item xl={4} md={5} xs={12}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            color={'primary'}
          >
            {/*<LoginNormalContainer />*/}
            <LoginRegistroContainer />
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
