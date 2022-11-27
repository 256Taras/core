import { isIP, isIPv4 } from 'node:net';
import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { ValidationRules } from './interfaces/validation-rules.interface';

@Service()
export class Validator {
  constructor(private request: Request, private response: Response) {}

  private validateAccepted(
    value: string,
    isAccepted: boolean,
    fieldName: string,
  ): boolean | string {
    if (
      (isAccepted && !value) ||
      ![true, 'true', 'on', 'yes', '1', 1].includes(value)
    ) {
      return `Field ${fieldName} must be accepted`;
    }

    return true;
  }

  private validateDate(
    value: string,
    isDate: boolean,
    fieldName: string,
  ): boolean | string {
    if (
      (isDate && (new Date(value) as unknown) === 'Invalid Date') ||
      isNaN(new Date(value) as unknown as number)
    ) {
      return `Field ${fieldName} must be a valid date format`;
    }

    return true;
  }

  private validateDoesntEndWith(
    value: string,
    search: string,
    fieldName: string,
  ): boolean | string {
    if (value.endsWith(search)) {
      return `Field ${fieldName} must not end with '${search}'`;
    }

    return true;
  }

  private validateDoesntStartWith(
    value: string,
    search: string,
    fieldName: string,
  ): boolean | string {
    if (value.endsWith(search)) {
      return `Field ${fieldName} must not start with '${search}'`;
    }

    return true;
  }

  private validateEndsWith(
    value: string,
    search: string,
    fieldName: string,
  ): boolean | string {
    if (!value.endsWith(search)) {
      return `Field ${fieldName} must end with '${search}'`;
    }

    return true;
  }

  private validateEmail(
    value: string,
    isEmail: boolean,
    fieldName: string,
  ): boolean | string {
    const emailRegexp =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (isEmail && !emailRegexp.test(value)) {
      return `Field ${fieldName} must be a valid email`;
    }

    return true;
  }

  private validateFloat(
    value: number,
    isFloat: boolean,
    fieldName: string,
  ): boolean | string {
    if ((isFloat && Number.isInteger(value)) || isNaN(value)) {
      return `Field ${fieldName} must be a floating point number`;
    }

    return true;
  }

  private validateIn(
    value: string,
    array: any[],
    fieldName: string,
  ): boolean | string {
    if (!array.includes(value)) {
      return `Field ${fieldName} must be a value from [${array.join(', ')}]`;
    }

    return true;
  }

  private validateInteger(
    value: number,
    isInteger: boolean,
    fieldName: string,
  ): boolean | string {
    if ((isInteger && !Number.isInteger(value)) || isNaN(value)) {
      return `Field ${fieldName} must be an integer number`;
    }

    return true;
  }

  private validateIp(
    value: string,
    ip: boolean,
    fieldName: string,
  ): boolean | string {
    if (ip && !isIP(value)) {
      return `Field ${fieldName} must be a valid IP address`;
    }

    return true;
  }

  private validateIpv4(
    value: string,
    ipv4: boolean,
    fieldName: string,
  ): boolean | string {
    if (ipv4 && !isIPv4(value)) {
      return `Field ${fieldName} must be a valid IPv4 address`;
    }

    return true;
  }

  private validateLength(
    value: string,
    length: number,
    fieldName: string,
  ): boolean | string {
    if (value.length !== length) {
      return `Field ${fieldName} must be ${length} characters long`;
    }

    return true;
  }

  private validateLowercase(
    value: string,
    lowercase: boolean,
    fieldName: string,
  ): boolean | string {
    if (lowercase && value !== value.toLowerCase()) {
      return `Field ${fieldName} must be a lowercased string`;
    }

    return true;
  }

  private validateMax(
    value: number,
    length: number,
    fieldName: string,
  ): boolean | string {
    if (isNaN(value) || Number(value) > length) {
      return `Field ${fieldName} must be less than ${length}`;
    }

    return true;
  }

  private validateMaxLength(
    value: string,
    length: number,
    fieldName: string,
  ): boolean | string {
    if (value.length > length) {
      return `Field ${fieldName} must be shorther than ${length} characters`;
    }

    return true;
  }

  private validateMin(
    value: number,
    length: number,
    fieldName: string,
  ): boolean | string {
    if (isNaN(value) || Number(value) < length) {
      return `Field ${fieldName} must be greater than ${length}`;
    }

    return true;
  }

  private validateMinLength(
    value: string,
    length: number,
    fieldName: string,
  ): boolean | string {
    if (value.length < length) {
      return `Field ${fieldName} must be longer than ${length} characters`;
    }

    return true;
  }

  private validateNotIn(
    value: string,
    array: any[],
    fieldName: string,
  ): boolean | string {
    if (array.includes(value)) {
      return `Field ${fieldName} must not be a value from [${array.join(', ')}]`;
    }

    return true;
  }

  private validateNumeric(
    value: number,
    isNumeric: boolean,
    fieldName: string,
  ): boolean | string {
    if (isNumeric && isNaN(value)) {
      return `Field ${fieldName} must be numeric`;
    }

    return true;
  }

  private validateOtherThan(
    value: string,
    search: string,
    fieldName: string,
  ): boolean | string {
    if (value === search) {
      return `Field ${fieldName} must be other than '${search}'`;
    }

    return true;
  }

  private validateRegexp(
    value: string,
    regexp: RegExp,
    fieldName: string,
  ): boolean | string {
    if (!regexp.test(value)) {
      return `Field ${fieldName} must follow the ${regexp.toString()} pattern`;
    }

    return true;
  }

  private validateRequired(
    value: string,
    isRequired: boolean,
    fieldName: string,
  ): boolean | string {
    if ((isRequired && !value) || value === '') {
      return `Field ${fieldName} is required`;
    }

    return true;
  }

  private validateSameAs(
    value: string,
    secondField: string,
    fieldName: string,
  ): boolean | string {
    if (value !== this.request.input(secondField)) {
      return `Field ${fieldName} must be same as ${secondField}`;
    }

    return true;
  }

  private validateStartsWith(
    value: string,
    search: string,
    fieldName: string,
  ): boolean | string {
    if (!value.startsWith(search)) {
      return `Field ${fieldName} must start with '${search}'`;
    }

    return true;
  }

  private validateUppercase(
    value: string,
    uppercase: boolean,
    fieldName: string,
  ): boolean | string {
    if (uppercase && value !== value.toUpperCase()) {
      return `Field ${fieldName} must be an uppercased string`;
    }

    return true;
  }

  private validateUsername(
    value: string,
    isUsername: boolean,
    fieldName: string,
  ): boolean | string {
    const usernameRegexp = /^[a-z][a-z0-9]*(?:[ _-][a-z0-9]*)*$/iu;

    if (isUsername && !usernameRegexp.test(value)) {
      return `Field ${fieldName} must be a valid username`;
    }

    return true;
  }

  public $setRequest(request: Request): void {
    this.request = request;
  }

  public $setResponse(response: Response): void {
    this.response = response;
  }

  public assert(rules: Record<string, ValidationRules>, checkOnly = false): boolean {
    const ruleMapper: Record<string, Function> = {
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
      lowercase: this.validateLowercase,
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
      uppercase: this.validateUppercase,
      username: this.validateUsername,
    };

    const errors: Record<string, string> = {};

    for (const [fieldName, ruleSet] of Object.entries(rules)) {
      const fieldValue = this.request.input(fieldName);

      for (const [rule, ruleValue] of Object.entries(ruleSet)) {
        if (!(rule in ruleMapper)) {
          throw new Error(`Invalid validation rule '${rule}'`);
        }

        const result = ruleMapper[rule](fieldValue, ruleValue, fieldName);

        if (typeof result === 'string') {
          errors[fieldName] = result;

          if (checkOnly) {
            return false;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      this.response.redirectBack({ errors }, StatusCode.BadRequest);
    }

    return true;
  }
}
