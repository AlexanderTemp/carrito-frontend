'use client'
import { ProductoCarrito } from '@/app/admin/(compras)/productos-disponibles/types/carritoTypes'
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react'

interface UIContextType {
  cartOpen: boolean
  cartEstado: boolean
  activeEstado: () => void
  deactiveEstado: () => void
  openCartDrawer: () => void
  closeCartDrawer: () => void
  cartContent: ProductoCarrito[]
  addNuevoProducto: (producto: ProductoCarrito) => void
  eliminarProducto: (id: number) => void
  disminuirProducto: (producto: ProductoCarrito) => void
}

const UIContext = createContext<UIContextType>({} as UIContextType)
const useCart = () => useContext(UIContext)

const CartProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [cartOpen, setCartOpen] = useState<boolean>(false)
  const [cartEstado, setCartEstado] = useState<boolean>(false)
  const [cartContent, setCartContent] = useState<ProductoCarrito[]>([])

  const activeEstado = () => {
    setCartEstado(true)
  }
  const deactiveEstado = () => {
    setCartEstado(false)
  }

  const openCartDrawer = () => {
    setCartOpen(true)
  }

  const closeCartDrawer = () => {
    setCartOpen(false)
  }
  const addNuevoProducto = (producto: ProductoCarrito) => {
    let sw = cartContent.some((elem) => elem.id === producto.id)

    if (sw) {
      // si el producto ya existe sumar más uno
      const updatedCartContent = cartContent.map((item) => {
        if (item.id === producto.id) {
          return { ...item, cantidad: item.cantidad + 1 }
        }
        return item
      })
      setCartContent(updatedCartContent)
    } else {
      setCartContent([...cartContent, producto])
    }
  }

  const disminuirProducto = (producto: ProductoCarrito) => {
    let sw = false
    const updatedCartContent = cartContent.map((item) => {
      if (item.cantidad - 1 === 0) sw = true
      if (item.id === producto.id) {
        return { ...item, cantidad: item.cantidad - 1 }
      }
      return item
    })
    if (sw) {
      setCartContent(updatedCartContent)
    } else {
      eliminarProducto(producto.id)
    }
  }

  const eliminarProducto = (id: number) => {
    const productoClean: ProductoCarrito[] = cartContent.filter(
      (elem) => elem.id !== id
    )
    setCartContent(productoClean)
  }

  return (
    <UIContext.Provider
      value={{
        cartOpen,
        cartEstado,
        cartContent,
        addNuevoProducto,
        disminuirProducto,
        eliminarProducto,

        // Methods
        openCartDrawer,
        closeCartDrawer,
        activeEstado,
        deactiveEstado,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export { useCart, CartProvider }
