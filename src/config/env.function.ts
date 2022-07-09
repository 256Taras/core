export const env = (key: string): string | number | boolean | null => {
  if (!(key in process.env)) {
    return null;
  }

  try {
    const casted = JSON.parse(process.env[key]?.toString() ?? 'null');

    return casted;
  } catch {
    return process.env[key] ?? null;
  }
};
