import { Authorizer } from '../interfaces/authorizer.interface.js';

export type Channel = Authorizer & {
  namePattern: RegExp;
  serverName: string;
};
