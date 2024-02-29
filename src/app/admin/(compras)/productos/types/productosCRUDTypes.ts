/// CRUD de parametros

export interface ProductoCRUDType {
  id: string
  codigoProducto: string
  nombreProducto: string
  descripcion: string
  precio: number
  cantidadDisponible: number
  imagen: string
  estado: string
}

export interface CrearEditarProductoCRUDType {
  id?: string
  codigoProducto: string
  nombreProducto: string
  descripcion: string
  precio: number
  cantidadDisponible: number
  imagen?: File | string
}
