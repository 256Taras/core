export const env = <T = null>(key: string): T => {
  if (!(key in process.env)) {
    return null as unknown as T;
  }

  try {
    const casted = JSON.parse(process.env[key]?.toString() ?? 'null');

    return casted;
  } catch {
    return (process.env[key] ?? null) as unknown as T;
  }
};
