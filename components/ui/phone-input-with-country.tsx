"use client"

import { Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePhoneValidation } from "@/hooks/use-phone-validation"
import { countries, getCountryByCode } from "@/lib/countries"
import { forwardRef, useEffect } from "react"

interface PhoneInputWithCountryProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
  error?: string
  disabled?: boolean
  id?: string
  selectedCountryCode?: string // Country code to auto-set phone prefix
}

export const PhoneInputWithCountry = forwardRef<HTMLInputElement, PhoneInputWithCountryProps>(
  ({ 
    value, 
    onChange, 
    onBlur, 
    placeholder, 
    label = "Phone Number", 
    required = false,
    className = "",
    error,
    disabled = false,
    id = "phone",
    selectedCountryCode
  }, ref) => {
    const {
      validationStatus,
      validationMessage,
      handlePhoneChange,
      initializeValidation,
      resetValidation
    } = usePhoneValidation()

    // Auto-set phone prefix when country changes
    useEffect(() => {
      if (selectedCountryCode && !value) {
        const country = getCountryByCode(selectedCountryCode)
        if (country) {
          onChange(country.phoneCode)
        }
      }
    }, [selectedCountryCode, value, onChange])

    // Initialize validation for existing values
    useEffect(() => {
      initializeValidation(value)
    }, [])

    const handleChange = (newValue: string) => {
      const updateField = (fieldName: string, formattedValue: string) => {
        onChange(formattedValue)
      }
      handlePhoneChange(newValue, updateField, "phone")
    }

    const getBorderColor = () => {
      if (error) return "border-red-500"
      if (validationStatus === "valid") return "border-green-500"
      if (validationStatus === "invalid") return "border-red-500"
      return ""
    }

    // Get suggested placeholder based on selected country
    const getSuggestedPlaceholder = () => {
      if (selectedCountryCode) {
        const country = getCountryByCode(selectedCountryCode)
        if (country) {
          return `${country.phoneCode}1234567890`
        }
      }
      return placeholder || "+1234567890"
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {label} {!required && "(Optional)"}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={getSuggestedPlaceholder()}
            disabled={disabled}
            className={`${getBorderColor()} ${validationStatus === "valid" ? "pr-8" : ""} ${className}`}
          />
          {validationStatus === "valid" && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-green-500 text-sm">✓</span>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {validationMessage && !error && (
          <p className={`text-sm ${validationStatus === "valid" ? "text-green-600" : "text-amber-600"}`}>
            {validationMessage}
          </p>
        )}
        {selectedCountryCode && (
          <p className="text-xs text-gray-500">
            Format for {getCountryByCode(selectedCountryCode)?.name}: {getCountryByCode(selectedCountryCode)?.phoneCode}XXXXXXXXX
          </p>
        )}
      </div>
    )
  }
)

PhoneInputWithCountry.displayName = "PhoneInputWithCountry" 