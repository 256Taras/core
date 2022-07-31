import { Constructor } from '../utils/interfaces/constructor.interface';

export class Module {
  constructor(public controllers: Constructor[], public channels: Constructor[]) {}
}
