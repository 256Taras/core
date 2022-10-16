import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Authorizer } from '../interfaces/authorizer.nterface';

export type Channel = Constructor &
  Authorizer & {
    namePattern: RegExp;
  };
