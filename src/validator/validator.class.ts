import { isIP, isIPv4 } from 'net';
import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { ValidationAssertions } from './interfaces/validation-assertions.interface';

@Service()
export class Validator {
  private emailRegexp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private usernameRegexp = /^[a-z][a-z0-9]*(?:[ _-][a-z0-9]*)*$/iu;

  constructor(private request: Request, private response: Response) {}

  private validateAccepted(value: string, isAccepted: boolean): boolean {
    if (isAccepted && !value) {
      return false;
    }

    return true;
  }

  private validateDate(value: string, isDate: boolean): boolean {
    if (
      (isDate && (new Date(value) as unknown) === 'Invalid Date') ||
      isNaN(new Date(value) as unknown as number)
    ) {
      return false;
    }

    return true;
  }

  private validateDoesntEndWith(value: string, search: string): boolean {
    if (value.endsWith(search)) {
      return false;
    }

    return true;
  }

  private validateDoesntStartWith(value: string, search: string): boolean {
    if (value.endsWith(search)) {
      return false;
    }

    return true;
  }

  private validateEndsWith(value: string, search: string): boolean {
    if (!value.endsWith(search)) {
      return false;
    }

    return true;
  }

  private validateEmail(value: string, isEmail: boolean): boolean {
    if (isEmail && !this.emailRegexp.test(value)) {
      return false;
    }

    return true;
  }

  private validateFloat(value: number, isFloat: boolean): boolean {
    if ((isFloat && Number.isInteger(value)) || isNaN(value)) {
      return false;
    }

    return true;
  }

  private validateIn(value: string, array: any[]): boolean {
    if (!array.includes(value)) {
      return false;
    }

    return true;
  }

  private validateInteger(value: number, isInteger: boolean): boolean {
    if ((isInteger && !Number.isInteger(value)) || isNaN(value)) {
      return false;
    }

    return true;
  }

  private validateIp(value: string, ip: boolean): boolean {
    if (ip && !isIP(value)) {
      return false;
    }

    return true;
  }

  private validateIpv4(value: string, ipv4: boolean): boolean {
    if (ipv4 && !isIPv4(value)) {
      return false;
    }

    return true;
  }

  private validateLength(value: string, length: number): boolean {
    if (value.length !== length) {
      return false;
    }

    return true;
  }

  private validateMax(value: number, length: number): boolean {
    if (isNaN(value) || Number(value) > length) {
      return false;
    }

    return true;
  }

  private validateMaxLength(value: string, length: number): boolean {
    if (value.length > length) {
      return false;
    }

    return true;
  }

  private validateMin(value: number, length: number): boolean {
    if (isNaN(value) || Number(value) < length) {
      return false;
    }

    return true;
  }

  private validateMinLength(value: string, length: number): boolean {
    if (value.length < length) {
      return false;
    }

    return true;
  }

  private validateNotIn(value: string, array: any[]): boolean {
    if (array.includes(value)) {
      return false;
    }

    return true;
  }

  private validateNumeric(value: number, isNumeric: boolean): boolean {
    if (isNumeric && isNaN(value)) {
      return false;
    }

    return true;
  }

  private validateOtherThan(value: string, search: string): boolean {
    if (value === search) {
      return false;
    }

    return true;
  }

  private validateRegexp(value: string, regexp: RegExp): boolean {
    if (!regexp.test(value)) {
      return false;
    }

    return true;
  }

  private validateRequired(value: string, isRequired: boolean): boolean {
    if ((isRequired && !value) || value === '') {
      return false;
    }

    return true;
  }

  private validateSameAs(value: string, secondField: string): boolean {
    if (value !== this.request.input(secondField)) {
      return false;
    }

    return true;
  }

  private validateStartsWith(value: string, search: string): boolean {
    if (!value.startsWith(search)) {
      return false;
    }

    return true;
  }

  private validateUsername(value: string, isUsername: boolean): boolean {
    if (isUsername && !this.usernameRegexp.test(value)) {
      return false;
    }

    return true;
  }

  public assert(rules: ValidationAssertions, checkOnly = false): boolean {
    const ruleMapper: Record<string, any> = {
      accepted: this.validateAccepted,
      date: this.validateDate,
      doesntEndWith: this.validateDoesntEndWith,
      doesntStartWith: this.validateDoesntStartWith,
      endsWith: this.validateEndsWith,
      email: this.validateEmail,
      float: this.validateFloat,
      in: this.validateIn,
      integer: this.validateInteger,
      ip: this.validateIp,
      ipv4: this.validateIpv4,
      length: this.validateLength,
      max: this.validateMax,
      maxLength: this.validateMaxLength,
      min: this.validateMin,
      minLength: this.validateMinLength,
      notIn: this.validateNotIn,
      numeric: this.validateNumeric,
      otherThan: this.validateOtherThan,
      regexp: this.validateRegexp,
      required: this.validateRequired,
      sameAs: this.validateSameAs,
      startsWith: this.validateStartsWith,
      username: this.validateUsername,
    };

    for (const [field, ruleSet] of Object.entries(rules)) {
      const fieldValue = this.request.input(field);

      for (const [rule, ruleValue] of Object.entries(ruleSet)) {
        if (!(rule in ruleMapper)) {
          throw new Error(`Invalid validation rule '${rule}'`);
        }

        if (!ruleMapper[rule](fieldValue, ruleValue)) {
          if (!checkOnly) {
            this.response.redirectBack({}, StatusCode.BadRequest);

            continue;
          }

          return false;
        }
      }
    }

    return true;
  }
}
