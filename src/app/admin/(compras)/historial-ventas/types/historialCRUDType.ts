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
