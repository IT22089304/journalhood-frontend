"use client"

import { useState, useCallback } from "react"
import type { FormState } from "@/lib/types"

export function useForm<T extends Record<string, any>>(
  initialData: T,
  validationRules?: Record<keyof T, (value: any) => string | null>,
): FormState<T> & {
  updateField: (field: keyof T, value: any) => void
  validateField: (field: keyof T) => void
  validateForm: () => boolean
  resetForm: () => void
  setLoading: (loading: boolean) => void
  setError: (field: string, error: string) => void
} {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = useCallback(
    (field: keyof T) => {
      if (!validationRules?.[field]) return

      const error = validationRules[field](data[field])
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }))
    },
    [data, validationRules],
  )

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }))

      // Clear error when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [errors],
  )

  const validateForm = useCallback(() => {
    if (!validationRules) return true

    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(validationRules).forEach((field) => {
      const error = validationRules[field as keyof T](data[field as keyof T])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [data, validationRules])

  const setError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }, [])

  const resetForm = useCallback(() => {
    setData(initialData)
    setErrors({})
    setIsLoading(false)
  }, [initialData])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const isValid = Object.values(errors).every((error) => !error)

  return {
    data,
    errors,
    isLoading,
    isValid,
    updateField,
    validateField,
    validateForm,
    resetForm,
    setLoading,
    setError,
  }
}
