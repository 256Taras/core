export const env = <T = any>(
  key: string,
  defaultValue: string | boolean | number | null = null,
): T => {
  if (!(key in process.env)) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(process.env[key]?.toString() ?? String(defaultValue));
  } catch {
    return (process.env[key] ?? defaultValue) as unknown as T;
  }
};
