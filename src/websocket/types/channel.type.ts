import { Authorizer } from '../interfaces/authorizer.nterface';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export type Channel = Constructor &
  Authorizer & {
    namePattern: RegExp;
  };
