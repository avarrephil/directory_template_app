/**
 * Brand type utility for creating nominal types
 * Usage: type UserId = Brand<string, 'UserId'>
 */
export type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};

/**
 * Creates a branded value
 */
export function brand<T, TBrand extends string>(value: T): Brand<T, TBrand> {
  return value as Brand<T, TBrand>;
}

/**
 * Extracts the underlying value from a branded type
 */
export function unbrand<T, TBrand extends string>(
  brandedValue: Brand<T, TBrand>
): T {
  return brandedValue as T;
}

// Common branded types for IDs
export type UserId = Brand<string, "UserId">;
export type PostId = Brand<string, "PostId">;
export type SessionId = Brand<string, "SessionId">;
export type FileId = Brand<string, "FileId">;
