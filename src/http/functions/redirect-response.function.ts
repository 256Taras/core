import { RedirectResponse } from '../redirect-response.class';

export const redirectResponse = (url: string, data?: Record<string, any>) => {
  return new RedirectResponse(url, data);
};
