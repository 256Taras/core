import { Reflection as Reflect } from '@abraham/reflection';
import { Endpoint } from '../../router/types/endpoint.type.js';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { StatusCode } from '../enums/status-code.enum.js';

export function Redirect(
  url: RouteUrl | Endpoint,
  status: StatusCode = StatusCode.Found,
): MethodDecorator {
  return (originalClass) => {
    Reflect.defineMetadata('redirectUrl', url, originalClass);
    Reflect.defineMetadata('redirectStatus', status, originalClass);

    return originalClass;
  };
}
