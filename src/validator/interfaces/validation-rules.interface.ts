import { Integer } from '../../utils/types/integer.type';

export interface ValidationRules {
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
  length?: Integer;
  max?: Integer;
  maxLength?: Integer;
  min?: Integer;
  minLength?: Integer;
  notIn?: string[];
  numeric?: boolean;
  otherThan?: string;
  regexp?: RegExp;
  required?: boolean;
  sameAs?: string;
  startsWith?: string;
  username?: boolean;
}
