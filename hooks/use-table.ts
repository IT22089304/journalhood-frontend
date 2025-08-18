"use client"

import { useState, useMemo } from "react"
import type { TableState } from "@/lib/types"

export function useTable<T extends Record<string, any>>(
  initialData: T[],
  itemsPerPage = 10,
): TableState<T> & {
  setSearchTerm: (term: string) => void
  setSortField: (field: keyof T | null) => void
  setSortDirection: (direction: "asc" | "desc") => void
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedData: T[]
} {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading] = useState(false)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return initialData

    return initialData.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [initialData, searchTerm])

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  return {
    data: initialData,
    filteredData,
    searchTerm,
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage,
    isLoading,
    setSearchTerm,
    setSortField,
    setSortDirection,
    setCurrentPage,
    totalPages,
    paginatedData,
  }
}
