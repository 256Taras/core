export interface ValidationRules {
  [field: string]: {
    accepted?: boolean;
    date?: string | Date;
    doesntEndWith?: string;
    doesntStartWith?: string;
    endsWith?: string;
    email?: boolean;
    float?: boolean;
    in?: string[];
    integer?: boolean;
    ip?: boolean;
    ipv4?: boolean;
    length?: number;
    maxLength?: number;
    minLength?: number;
    notIn?: string[];
    numeric?: boolean;
    otherThan?: string;
    regexp?: RegExp;
    required?: boolean;
    sameAs?: string;
    startsWith?: string;
    username?: boolean;
  };
}
