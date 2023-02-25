import { createErrorTip } from './create-error-tip.function';

export function raise(message: string, cause?: string | { cause: Error }) {
  if (cause) {
    throw new Error(
      message,
      typeof cause === 'string' ? createErrorTip(cause) : cause,
    );
  }

  throw new Error(message);
}
