import { Authorizer } from '../interfaces/authorizer.interface';

export type Channel = Authorizer & {
  namePattern: RegExp;
  serverName: string;
};
