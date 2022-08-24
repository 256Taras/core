export interface ValidationRules {
  [field: string]: {
    date?: string | Date,
    endsWith?: string;
    email?: boolean;
    float?: boolean;
    in?: any[];
    integer?: boolean;
    ip?: boolean;
    ipv4?: boolean;
    notIn?: any[];
    numeric?: boolean;
    otherThan?: string;
    regexp?: RegExp;
    required?: boolean;
    sameAs?: string;
    startsWith?: string;
    username?: boolean;
  };
}
