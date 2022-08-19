// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Session } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
  }
}
