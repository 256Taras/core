export function env<T = any>(
  key: string,
  defaultValue: string | boolean | number | null = null,
): T {
  if (!(key in process.env)) {
    return null as unknown as T;
  }

  return (process.env[key] ?? defaultValue) as unknown as T;
}
