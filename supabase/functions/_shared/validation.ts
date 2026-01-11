// Input validation utilities for checkout data

// Maximum field lengths
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 300;
const MAX_CITY_LENGTH = 100;
const MAX_POSTAL_CODE_LENGTH = 10;
const MAX_NOTES_LENGTH = 500;

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidatedCheckoutData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    city: string;
    address: string;
    postalCode: string;
  };
  notes?: string;
}

/**
 * Sanitize a string by trimming and removing potentially dangerous characters
 */
function sanitizeString(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Hard limit to prevent extremely long strings
}

/**
 * Validate email format and length
 */
function validateEmail(email: string): ValidationError | null {
  const sanitized = sanitizeString(email);
  
  if (!sanitized) {
    return { field: "email", message: "Email is required" };
  }
  
  if (sanitized.length > MAX_EMAIL_LENGTH) {
    return { field: "email", message: `Email must be less than ${MAX_EMAIL_LENGTH} characters` };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { field: "email", message: "Invalid email format" };
  }
  
  return null;
}

/**
 * Validate phone number format and length
 */
function validatePhone(phone: string): ValidationError | null {
  const sanitized = sanitizeString(phone);
  
  if (!sanitized) {
    return { field: "phone", message: "Phone number is required" };
  }
  
  if (sanitized.length > MAX_PHONE_LENGTH) {
    return { field: "phone", message: `Phone must be less than ${MAX_PHONE_LENGTH} characters` };
  }
  
  if (!PHONE_REGEX.test(sanitized)) {
    return { field: "phone", message: "Phone must contain only numbers and valid characters" };
  }
  
  return null;
}

/**
 * Validate customer name
 */
function validateName(name: string): ValidationError | null {
  const sanitized = sanitizeString(name);
  
  if (!sanitized) {
    return { field: "name", message: "Name is required" };
  }
  
  if (sanitized.length > MAX_NAME_LENGTH) {
    return { field: "name", message: `Name must be less than ${MAX_NAME_LENGTH} characters` };
  }
  
  if (sanitized.length < 2) {
    return { field: "name", message: "Name must be at least 2 characters" };
  }
  
  return null;
}

/**
 * Validate shipping address fields
 */
function validateShippingAddress(address: { city?: string; address?: string; postalCode?: string }): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const city = sanitizeString(address?.city);
  const streetAddress = sanitizeString(address?.address);
  const postalCode = sanitizeString(address?.postalCode);
  
  if (!city) {
    errors.push({ field: "city", message: "City is required" });
  } else if (city.length > MAX_CITY_LENGTH) {
    errors.push({ field: "city", message: `City must be less than ${MAX_CITY_LENGTH} characters` });
  }
  
  if (!streetAddress) {
    errors.push({ field: "address", message: "Address is required" });
  } else if (streetAddress.length > MAX_ADDRESS_LENGTH) {
    errors.push({ field: "address", message: `Address must be less than ${MAX_ADDRESS_LENGTH} characters` });
  }
  
  if (!postalCode) {
    errors.push({ field: "postalCode", message: "Postal code is required" });
  } else if (postalCode.length > MAX_POSTAL_CODE_LENGTH) {
    errors.push({ field: "postalCode", message: `Postal code must be less than ${MAX_POSTAL_CODE_LENGTH} characters` });
  }
  
  return errors;
}

/**
 * Validate all checkout form data
 */
export function validateCheckoutData(data: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: { city?: string; address?: string; postalCode?: string };
  notes?: string;
}): { valid: boolean; errors: ValidationError[]; sanitized: ValidatedCheckoutData | null } {
  const errors: ValidationError[] = [];
  
  // Validate individual fields
  const nameError = validateName(data.customerName || "");
  if (nameError) errors.push(nameError);
  
  const emailError = validateEmail(data.customerEmail || "");
  if (emailError) errors.push(emailError);
  
  const phoneError = validatePhone(data.customerPhone || "");
  if (phoneError) errors.push(phoneError);
  
  const addressErrors = validateShippingAddress(data.shippingAddress || {});
  errors.push(...addressErrors);
  
  // Validate notes (optional)
  const sanitizedNotes = sanitizeString(data.notes);
  if (sanitizedNotes && sanitizedNotes.length > MAX_NOTES_LENGTH) {
    errors.push({ field: "notes", message: `Notes must be less than ${MAX_NOTES_LENGTH} characters` });
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }
  
  // Return sanitized data
  return {
    valid: true,
    errors: [],
    sanitized: {
      customerName: sanitizeString(data.customerName).substring(0, MAX_NAME_LENGTH),
      customerEmail: sanitizeString(data.customerEmail).substring(0, MAX_EMAIL_LENGTH).toLowerCase(),
      customerPhone: sanitizeString(data.customerPhone).substring(0, MAX_PHONE_LENGTH),
      shippingAddress: {
        city: sanitizeString(data.shippingAddress?.city).substring(0, MAX_CITY_LENGTH),
        address: sanitizeString(data.shippingAddress?.address).substring(0, MAX_ADDRESS_LENGTH),
        postalCode: sanitizeString(data.shippingAddress?.postalCode).substring(0, MAX_POSTAL_CODE_LENGTH),
      },
      notes: sanitizedNotes ? sanitizedNotes.substring(0, MAX_NOTES_LENGTH) : undefined,
    },
  };
}

/**
 * Validate cart item data
 */
export function validateCartItem(item: {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
}): ValidationError | null {
  if (!item.productId || typeof item.productId !== "string") {
    return { field: "productId", message: "Invalid product ID" };
  }
  
  if (!item.name || typeof item.name !== "string" || item.name.length > 200) {
    return { field: "name", message: "Invalid product name" };
  }
  
  if (typeof item.price !== "number" || item.price < 0 || item.price > 100000) {
    return { field: "price", message: "Invalid price" };
  }
  
  if (typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 100 || !Number.isInteger(item.quantity)) {
    return { field: "quantity", message: "Invalid quantity" };
  }
  
  return null;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
