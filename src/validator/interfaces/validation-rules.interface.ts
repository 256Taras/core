export interface ValidationRules {
  [field: string]: {
    email?: boolean;
    numeric?: boolean;
    regexp?: RegExp;
    required?: boolean;
    username?: boolean,
  }
}
