import { Reflection as Reflect } from '@abraham/reflection';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { StatusCode } from '../enums/status-code.enum.js';

export function Redirect(
  url: RouteUrl,
  status: StatusCode = StatusCode.Found,
): MethodDecorator {
  return (target) => {
    Reflect.defineMetadata('redirectUrl', url, target);
    Reflect.defineMetadata('redirectStatus', status, target);
  };
}
