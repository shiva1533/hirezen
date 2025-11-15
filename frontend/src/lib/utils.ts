import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a JSON string or returns the value if it's already parsed
 * @param value - The value to parse (string, array, or null/undefined)
 * @param defaultValue - The default value to return if parsing fails
 * @returns Parsed value or default value
 */
export function safeJSONParse<T>(value: unknown, defaultValue: T): T {
  // If value is null or undefined, return default
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // If value is already an array or object, return it
  if (Array.isArray(value) || typeof value === "object") {
    return value as T;
  }

  // If value is a string, try to parse it
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed as T;
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Validates and ensures a value is a string array
 */
export const stringArraySchema = z.array(z.string()).default([]);

/**
 * Validates and parses a string array field
 * @param value - The value to validate
 * @returns Validated string array
 */
export function validateStringArray(value: unknown): string[] {
  const parsed = safeJSONParse(value, []);
  const result = stringArraySchema.safeParse(parsed);
  return result.success ? result.data : [];
}

/**
 * Interview question schema
 */
export const interviewQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["text", "video", "audio"]).optional(),
  duration: z.number().optional(),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

/**
 * Validates and parses interview questions array
 * @param value - The value to validate
 * @returns Validated interview questions array
 */
export function validateInterviewQuestions(value: unknown): InterviewQuestion[] {
  const parsed = safeJSONParse(value, []);
  const schema = z.array(interviewQuestionSchema).default([]);
  const result = schema.safeParse(parsed);
  return result.success ? result.data : [];
}

/**
 * Ensures a value is properly formatted as a JSON string for database storage
 * @param value - The value to stringify
 * @returns JSON string or null if value is empty
 */
export function toJSONString(value: unknown): string | null {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  if (typeof value === "string") {
    // If it's already a string, try to parse and re-stringify to ensure validity
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      // If parsing fails, wrap in array if it looks like a simple value
      return JSON.stringify([value]);
    }
  }
  
  return JSON.stringify(value);
}
