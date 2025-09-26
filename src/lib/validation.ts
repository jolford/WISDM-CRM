import { z } from "zod";

// Base validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" });

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || /^[\+]?[\d\s\-\(\)\.]+$/.test(val), {
    message: "Invalid phone number format"
  });

export const textFieldSchema = z
  .string()
  .trim()
  .max(1000, { message: "Text must be less than 1000 characters" })
  .optional();

export const longTextSchema = z
  .string()
  .trim()
  .max(5000, { message: "Text must be less than 5000 characters" })
  .optional();

// Authentication schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

// Contact validation schema
export const contactSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  mobile: phoneSchema,
  title: textFieldSchema,
  department: textFieldSchema,
  account_name: textFieldSchema,
  notes: longTextSchema,
  lead_source: textFieldSchema,
});

// Deal validation schema
export const dealSchema = z.object({
  name: z.string().trim().min(1, { message: "Deal name is required" }).max(200, { message: "Deal name must be less than 200 characters" }),
  value: z.number().min(0, { message: "Deal value must be positive" }).optional(),
  probability: z.number().min(0).max(100, { message: "Probability must be between 0 and 100" }).optional(),
  description: longTextSchema,
  notes: longTextSchema,
});

// Account validation schema
export const accountSchema = z.object({
  name: z.string().trim().min(1, { message: "Account name is required" }).max(200, { message: "Account name must be less than 200 characters" }),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  website: z.string().trim().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
  industry: textFieldSchema,
  address: textFieldSchema,
  city: textFieldSchema,
  state: textFieldSchema,
  zip_code: z.string().trim().max(20, { message: "ZIP code must be less than 20 characters" }).optional(),
  country: textFieldSchema,
  notes: longTextSchema,
});

// Task validation schema
export const taskSchema = z.object({
  title: z.string().trim().min(1, { message: "Task title is required" }).max(200, { message: "Task title must be less than 200 characters" }),
  description: longTextSchema,
  due_date: z.string().optional(),
});

// Maintenance record validation schema
export const maintenanceSchema = z.object({
  product_name: z.string().trim().min(1, { message: "Product name is required" }).max(200, { message: "Product name must be less than 200 characters" }),
  product_type: z.string().trim().min(1, { message: "Product type is required" }).max(100, { message: "Product type must be less than 100 characters" }),
  vendor_name: textFieldSchema,
  license_key: textFieldSchema,
  serial_number: textFieldSchema,
  cost: z.number().min(0, { message: "Cost must be positive" }).optional(),
  notes: longTextSchema,
});

// Project validation schema
export const projectSchema = z.object({
  name: z.string().trim().min(1, { message: "Project name is required" }).max(200, { message: "Project name must be less than 200 characters" }),
  description: longTextSchema,
  client: textFieldSchema,
  budget: z.number().min(0, { message: "Budget must be positive" }).optional(),
  billable_rate: z.number().min(0, { message: "Billable rate must be positive" }).optional(),
  hours_estimated: z.number().min(0, { message: "Estimated hours must be positive" }).optional(),
});

// Utility function to safely validate data
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message),
      };
    }
    return {
      success: false,
      errors: ["Validation failed"],
    };
  }
}

// XSS prevention utility
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// SQL injection prevention utility
export function validateNoSqlInjection(input: string): boolean {
  const sqlInjectionPattern = /(drop|delete|truncate|alter|create|exec|execute|union|select|insert|update)\s/i;
  return !sqlInjectionPattern.test(input);
}

export type { z };