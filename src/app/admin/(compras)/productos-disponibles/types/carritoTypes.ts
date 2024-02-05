export interface Carrito {
  estado: boolean
  productos: Producto[]
}

export interface Producto {
  id: number
  cantidad: number

  codigoProducto: string
  nombreProducto: string
  descripcion: string
  precio: number
  cantidadDisponible: number
  imagen: string
  estado: string
}
