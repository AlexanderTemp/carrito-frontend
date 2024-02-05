/// CRUD de parametros

export interface ProductoCRUDType {
  id: string
  codigoProducto: string
  nombreProducto: string
  descripcion: string
  precio: string
  cantidadDisponible: string
  imagen: string
  estado: string
}

export interface CrearEditarProductoCRUDType {
  id?: string
  codigoProducto: string
  nombreProducto: string
  descripcion: string
  precio: string
  cantidadDisponible: string
  imagen: string
}
