// Phone validation patterns that match backend validation
export const PHONE_VALIDATION_PATTERNS = {
  // Super Admin and School Admin pattern: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
  SUPER_ADMIN: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
  
  // District Admin pattern: /^\+?[\d\s-()]{10,15}$/
  DISTRICT_ADMIN: /^\+?[\d\s-()]{10,15}$/,
  
  // Default pattern (matches super admin pattern)
  DEFAULT: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
}

// Phone validation function that matches backend validation
export function validatePhoneNumber(value: string, pattern: RegExp = PHONE_VALIDATION_PATTERNS.DEFAULT): string | null {
  if (!value) return null // Allow empty phone numbers
  
  if (!pattern.test(value)) {
    return "Invalid phone number format. Please use digits, spaces, +, parentheses, or hyphens."
  }
  
  return null
}

// Format phone number for display/input
export function formatPhoneNumber(value: string): string {
  // Keep the original value with minimal formatting
  // Allow +, digits, spaces, parentheses, and hyphens
  let formatted = value.replace(/[^\d+\s\-()]/g, '')
  
  // Limit to reasonable length
  if (formatted.length > 20) {
    formatted = formatted.substring(0, 20)
  }
  
  return formatted
}

// Check if phone number is valid according to backend patterns
export function isValidPhoneNumber(value: string, pattern: RegExp = PHONE_VALIDATION_PATTERNS.DEFAULT): boolean {
  if (!value) return true // Allow empty phone numbers
  return pattern.test(value)
}

// Get validation message for phone number
export function getPhoneValidationMessage(value: string, pattern: RegExp = PHONE_VALIDATION_PATTERNS.DEFAULT): string {
  if (!value) return ""
  
  if (!pattern.test(value)) {
    return "Invalid format. Use digits, spaces, +, parentheses, or hyphens."
  }
  
  return "✓ Valid phone number"
} 