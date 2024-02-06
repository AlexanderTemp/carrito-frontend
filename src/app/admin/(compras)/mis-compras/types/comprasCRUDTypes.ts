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

/*

      {/*
      <FormInputDropdown
        label=""
        key={`${ventaData.idVenta}-${indexVenta}-cambio`}
        id="dropdown-select"
        name="change-sale-state"
        onChange={() => {}}
        options={[
          {
            key: '1',
            value: 'PENDIENTE',
            label: 'PENDIENTE',
          },
          {
            key: '2',
            value: 'ENVIADO',
            label: 'ENVIADO',
          },
          {
            key: '3',
            value: 'ENTREGADO',
            label: 'ENTREGADO',
          },
          {
            key: '4',
            value: 'CANCELADO',
            label: 'CANCELADO',
          },
        ]}
      />,


*/
