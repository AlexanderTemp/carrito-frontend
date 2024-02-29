export interface RowCompra {
  idProducto: number
  codigoProducto: string
  nombreProducto: string
  cantidad: number
  precio: number
}

export type estadoCompra = 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'

export interface ComprasCRUDType {
  estado: string
  idVenta: number
  codigoVenta: string
  totalVenta: number
  productos: RowCompra[]
}
