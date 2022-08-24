import { Exception } from '../handler/exception.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { ValidationRules } from './interfaces/validation-rules.interface';

@Service()
export class Validator {
  private emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private usernameRegexp = /^[a-z][a-z0-9]*(?:[ _-][a-z0-9]*)*$/iu;

  constructor(private request: Request, private response: Response) {}

  private checkEmailRule(value: string, isEmail: boolean): boolean {
    if (isEmail && !this.emailRegexp.test(value)) {
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

  private checkRegexpRule(value: string, regexp: RegExp): boolean {
    if (!regexp.test(value)) {
      return false;
    }

    return true;
  }

  private checkRequiredRule(value: string, isRequired: boolean): boolean {
    if (isRequired && !value || !String(value).length) {
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
      email: this.checkEmailRule,
      numeric: this.checkNumericRule,
      regexp: this.checkRegexpRule,
      required: this.checkRequiredRule,
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
