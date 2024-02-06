import { RowCompra } from '../../mis-compras/types/comprasCRUDTypes'

export interface VentaCRUDType {
  estado: string
  idVenta: number
  codigoVenta: string
  totalVenta: number
  productos: RowCompra[]
  nombreUsuario: string
  apellidosUsuario: string
}

export enum EstadoVenta {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export interface EnvioNuevoEstado {
  id: number
  estado: EstadoVenta
}
