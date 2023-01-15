export function env<T = any>(
  key: string,
  defaultValue: string | boolean | number | null = null,
): T | undefined {
  if (!(key in process.env)) {
    return null as unknown as T | undefined;
  }

  return (process.env[key] ?? defaultValue) as unknown as T | undefined;
}
