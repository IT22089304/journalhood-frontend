"use client"

import { useState, useCallback } from "react"
import { validatePhoneNumber, formatPhoneNumber, getPhoneValidationMessage, PHONE_VALIDATION_PATTERNS } from "@/lib/phone-validation"

export type PhoneValidationStatus = "idle" | "valid" | "invalid"

export interface PhoneValidationResult {
  status: PhoneValidationStatus
  message: string
  formattedValue: string
}

export function usePhoneValidation() {
  const [validationStatus, setValidationStatus] = useState<PhoneValidationStatus>("idle")
  const [validationMessage, setValidationMessage] = useState<string>("")

  // Live validation for phone number using backend pattern
  const validatePhoneLive = useCallback((value: string) => {
    if (!value) {
      setValidationStatus("idle")
      setValidationMessage("")
      return
    }

    const validationResult = validatePhoneNumber(value, PHONE_VALIDATION_PATTERNS.DEFAULT)
    const message = getPhoneValidationMessage(value, PHONE_VALIDATION_PATTERNS.DEFAULT)
    
    if (validationResult) {
      setValidationStatus("invalid")
      setValidationMessage(validationResult)
    } else {
      setValidationStatus("valid")
      setValidationMessage(message)
    }
  }, [])

  // Comprehensive validation for form submission using backend pattern
  const validatePhoneForSubmission = useCallback((value: string) => {
    return validatePhoneNumber(value, PHONE_VALIDATION_PATTERNS.DEFAULT)
  }, [])

  // Handle phone number input change
  const handlePhoneChange = useCallback((value: string, updateField: (field: string, value: string) => void, fieldName = "phone") => {
    const formatted = formatPhoneNumber(value)
    updateField(fieldName, formatted)
    validatePhoneLive(formatted)
  }, [validatePhoneLive])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationStatus("idle")
    setValidationMessage("")
  }, [])

  // Initialize validation for existing value (useful for edit forms)
  const initializeValidation = useCallback((value: string) => {
    if (value) {
      validatePhoneLive(value)
    } else {
      resetValidation()
    }
  }, [validatePhoneLive, resetValidation])

  return {
    validationStatus,
    validationMessage,
    formatPhoneNumber,
    validatePhoneLive,
    validatePhoneForSubmission,
    handlePhoneChange,
    resetValidation,
    initializeValidation,
  }
} 