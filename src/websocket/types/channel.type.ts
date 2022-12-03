import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Authorizer } from '../interfaces/authorizer.interface';

export type Channel = Constructor &
  Authorizer & {
    namePattern: RegExp;
  };
