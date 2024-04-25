import React, {createContext, useContext} from 'react'

type PaginationContextProps = {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  setCurrentPage: (page: number) => void
  setTotalItems: (total: number) => void
  setItemsPerPage: (perPage: number) => void
}

const PaginationContext = createContext<PaginationContextProps | undefined>(undefined)

export const usePagination = () => {
  const context = useContext(PaginationContext)
  if (!context) {
    throw new Error('usePagination must be used within a PaginationProvider')
  }
  return context
}

type PaginationProviderProps = {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  setCurrentPage: (page: number) => void
  setTotalItems: (total: number) => void
  setItemsPerPage: (perPage: number) => void
  children: React.ReactNode
}

export const PaginationProvider: React.FC<PaginationProviderProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setTotalItems,
  setItemsPerPage,
  children,
}) => {
  const value = {
    totalItems,
    setTotalItems,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
  }

  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>
}
