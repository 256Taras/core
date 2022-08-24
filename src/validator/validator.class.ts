import { Exception } from '../handler/exception.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { ValidationRules } from './interfaces/validation-rules.interface';
import { isIP, isIPv4 } from 'net';

@Service()
export class Validator {
  private emailRegexp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private usernameRegexp = /^[a-z][a-z0-9]*(?:[ _-][a-z0-9]*)*$/iu;

  constructor(private request: Request, private response: Response) {}

  private checkDateRule(value: string, isDate: boolean): boolean {
    if (
      (isDate && (new Date(value) as any) === 'Invalid Date') ||
      isNaN(new Date(value) as unknown as number)
    ) {
      return false;
    }

    return true;
  }

  private checkEndsWithRule(value: string, search: string): boolean {
    if (!value.endsWith(search)) {
      return false;
    }

    return true;
  }

  private checkEmailRule(value: string, isEmail: boolean): boolean {
    if (isEmail && !this.emailRegexp.test(value)) {
      return false;
    }

    return true;
  }

  private checkFloatRule(value: number, isFloat: boolean): boolean {
    if ((isFloat && Number.isInteger(value)) || isNaN(value)) {
      return false;
    }

    return true;
  }

  private checkInRule(value: string, array: any[]): boolean {
    if (!array.includes(value)) {
      return false;
    }

    return true;
  }

  private checkIntegerRule(value: number, isInteger: boolean): boolean {
    if ((isInteger && !Number.isInteger(value)) || isNaN(value)) {
      return false;
    }

    return true;
  }

  private checkIpRule(value: string, ip: boolean): boolean {
    if (ip && !isIP(value)) {
      return false;
    }

    return true;
  }

  private checkIpv4Rule(value: string, ipv4: boolean): boolean {
    if (ipv4 && !isIPv4(value)) {
      return false;
    }

    return true;
  }

  private checkNotInRule(value: string, array: any[]): boolean {
    if (array.includes(value)) {
      return false;
    }

    return true;
  }

  private checkNumericRule(value: number, isNumeric: boolean): boolean {
    if (isNumeric && isNaN(value)) {
      return false;
    }

    return true;
  }

  private checkOtherThanRule(value: string, search: string): boolean {
    if (value === search) {
      return false;
    }

    return true;
  }

  private checkRegexpRule(value: string, regexp: RegExp): boolean {
    if (!regexp.test(value)) {
      return false;
    }

    return true;
  }

  private checkRequiredRule(value: string, isRequired: boolean): boolean {
    if ((isRequired && !value) || value === '') {
      return false;
    }

    return true;
  }

  private checkSameAsRule(value: string, secondField: string): boolean {
    if (value !== this.request.input(secondField)) {
      return false;
    }

    return true;
  }

  private checkStartsWithRule(value: string, search: string): boolean {
    if (!value.startsWith(search)) {
      return false;
    }

    return true;
  }

  private checkUsernameRule(value: string, isUsername: boolean): boolean {
    if (isUsername && !this.usernameRegexp.test(value)) {
      return false;
    }

    return true;
  }

  public assert(rules: ValidationRules): void {
    const ruleMapper: Record<string, any> = {
      date: this.checkDateRule,
      endsWith: this.checkEndsWithRule,
      email: this.checkEmailRule,
      float: this.checkFloatRule,
      in: this.checkInRule,
      integer: this.checkIntegerRule,
      ip: this.checkIpRule,
      ipv4: this.checkIpv4Rule,
      notIn: this.checkNotInRule,
      numeric: this.checkNumericRule,
      otherThan: this.checkOtherThanRule,
      regexp: this.checkRegexpRule,
      required: this.checkRequiredRule,
      sameAs: this.checkSameAsRule,
      startsWith: this.checkStartsWithRule,
      username: this.checkUsernameRule,
    };

    for (const [field, ruleSet] of Object.entries(rules)) {
      const fieldValue = this.request.input(field);

      for (const [rule, ruleValue] of Object.entries(ruleSet)) {
        if (rule in ruleMapper) {
          ruleMapper[rule](fieldValue, ruleValue);

          continue;
        }

        throw new Exception(`Invalid validation rule '${rule}'`);
      }
    }
  }
}
