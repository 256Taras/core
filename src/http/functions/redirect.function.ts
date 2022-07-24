import { RedirectResponse } from '../redirect-response.class';

export const redirect = (url: string, data?: Record<string, any>) => {
  return new RedirectResponse(url, data);
}
