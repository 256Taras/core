import { ViewResponse } from '../../http/view-response.class';

export const render = (file: string, data?: Record<string, any>): ViewResponse => {
  return new ViewResponse(file, data);
};
