import { Integer } from '../../utils/types/integer.type';

export interface ValidationRules {
  accepted?: boolean;
  boolean?: boolean;
  date?: string | Date;
  declined?: boolean;
  doesntEndWith?: string;
  doesntStartWith?: string;
  endsWith?: string;
  email?: boolean;
  float?: boolean;
  in?: string[];
  integer?: boolean;
  ip?: boolean;
  ipv4?: boolean;
  ipv6?: boolean;
  json?: boolean;
  length?: Integer;
  lowercase?: boolean;
  max?: Integer;
  maxLength?: Integer;
  maxOrEqual?: Integer;
  maxOrEqualLength?: Integer;
  min?: Integer;
  minLength?: Integer;
  minOrEqual?: Integer;
  minOrEqualLength?: Integer;
  notIn?: string[];
  numeric?: boolean;
  otherThan?: string;
  regexp?: RegExp;
  required?: boolean;
  sameAs?: string;
  startsWith?: string;
  uppercase?: boolean;
  username?: boolean;
}
