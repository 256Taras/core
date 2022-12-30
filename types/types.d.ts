declare namespace NodeJS {
  export interface ProcessEnv {
    [key: string]: string | number | boolean | null | undefined;
  }
}
