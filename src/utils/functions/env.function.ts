export const env = <T = any>(key: string, defaultValue: unknown = null): T => {
  if (!(key in process.env)) {
    return null as unknown as T;
  }

  try {
    const casted = JSON.parse(process.env[key]?.toString() ?? JSON.parse(defaultValue));

    return casted;
  } catch {
    return (process.env[key] ?? defaultValue) as unknown as T;
  }
};
