'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { usePathname, useRouter } from 'next/navigation'

import Toolbar from '@mui/material/Toolbar'

import { imprimir } from '@/utils/imprimir'

import { versionNumber } from '@/utils'
import { ModuloType } from '@/app/login/types/loginTypes'
import { useSidebar } from '@/context/SideBarProvider'
import { useAuth } from '@/context/AuthProvider'
import { Icono } from '@/components/Icono'
import { useFullScreenLoading } from '@/context/FullScreenLoadingProvider'

const drawerWidth = 220

type SidebarModuloType = ModuloType & { showed?: boolean; open?: boolean }

export const Sidebar = () => {
  const { sideMenuOpen, closeSideMenu, openSideMenu } = useSidebar()

  const { usuario, rolUsuario, estaAutenticado, progresoLogin } = useAuth()

  const [modulos, setModulos] = useState<SidebarModuloType[]>([])

  const theme = useTheme()
  const router = useRouter()

  const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const md = useMediaQuery(theme.breakpoints.only('md'))
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const { estadoFullScreen } = useFullScreenLoading()

  const pathname = usePathname()

  const interpretarModulos = () => {
    imprimir(`Cambio en módulos`)

    const rolSeleccionado = usuario?.roles.find(
      (itemRol) => itemRol.idRol == rolUsuario?.idRol
    )

    imprimir(`rolSeleccionado`, rolSeleccionado)

    setModulos(
      rolSeleccionado?.modulos.map((modulo) => ({ ...modulo, open: true })) ??
        []
    )
  }

  const rutaActiva = (routeName: string, currentRoute: string) =>
    currentRoute.includes(routeName, 0)

  const navigateTo = (url: string) => {
    if (sm || xs || md) {
      closeSideMenu()
    }
    router.push(url)
  }

  useEffect(() => {
    if (sm || xs || md) {
      closeSideMenu()
    } else {
      openSideMenu()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sm, xs, md])

  useEffect(() => {
    interpretarModulos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(usuario)])

  return (
    <Drawer
      variant={sm || xs || md ? 'temporary' : 'persistent'}
      open={
        sideMenuOpen &&
        estaAutenticado &&
        modulos.length > 0 &&
        !progresoLogin &&
        !estadoFullScreen
      }
      onClose={closeSideMenu}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: sideMenuOpen ? drawerWidth : `0`,
        border: 'none',
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          borderWidth: 0.0,
          boxSizing: 'border-box',
        },
        transition: 'all 0.2s ease-out',
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        {modulos.map((modulo, index) => (
          <div key={`div-${index}`}>
            <Box
              sx={{
                display: 'flex',
                m: 0,
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].open = !tempModulos[index].open
                setModulos(tempModulos)
              }}
              onMouseOver={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].showed = true
                setModulos(tempModulos)
              }}
              onMouseLeave={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].showed = false
                setModulos(tempModulos)
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  m: 0,
                  borderRadius: 1,
                  alignItems: 'center',
                  margin: '16px 6px',
                  width: '100%',
                }}
              >
                <Box width={'20px'} />
                <Typography
                  variant={'body2'}
                  color={'text.secondary'}
                >{`${modulo.label}`}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                {(modulo.showed || !modulo.open) && (
                  <Icono
                    fontSize={'small'}
                    sx={{ p: 0, m: 0, mx: 1.5 }}
                    color={'secondary'}
                  >
                    {modulo.open ? 'expand_more' : 'navigate_next'}
                  </Icono>
                )}
              </Box>
            </Box>

            <Collapse in={modulo.open}>
              <List
                key={`submodulos-${index}`}
                component="ul"
                style={{ cursor: 'pointer' }}
                sx={{ pt: 0, pb: 0 }}
              >
                {modulo.subModulo.map((subModuloItem, indexSubModulo) => (
                  <ListItemButton
                    id={`submodulo-${index}-${indexSubModulo}`}
                    key={`submodulo-${index}-${indexSubModulo}`}
                    component="li"
                    selected={rutaActiva(subModuloItem.url, pathname)}
                    onClick={() => navigateTo(subModuloItem.url)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        m: 0,
                        borderRadius: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Box width={'10px'} />
                      <Icono>{subModuloItem.propiedades.icono}</Icono>

                      <Box width={'16px'} />
                      <Typography
                        variant={'body2'}
                      >{`${subModuloItem.label}`}</Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            {!modulo.open && <Divider sx={{ mx: 1 }} />}
          </div>
        ))}
      </Box>
      <Box sx={{ pb: 2 }} display="flex" flex="1" justifyContent="space-around">
        <Box sx={{ alignSelf: 'flex-end' }}>
          <Typography
            color="text.secondary"
            variant={'body2'}
          >{`v${versionNumber()}`}</Typography>
        </Box>
      </Box>
    </Drawer>
  )
}
