export interface ValidationRules {
  [field: string]: {
    endsWith?: string;
    email?: boolean;
    float?: boolean;
    in?: any[];
    integer?: boolean;
    ip?: boolean;
    ipv4?: boolean;
    notIn?: any[];
    numeric?: boolean;
    regexp?: RegExp;
    required?: boolean;
    sameAs?: string;
    startsWith?: string;
    username?: boolean,
  }
}
