import { isIP, isIPv4 } from 'node:net';
import { Configurator } from '../configurator/configurator.service';
import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.service';
import { Response } from '../http/response.service';
import { Service } from '../injector/decorators/service.decorator';
import { Integer } from '../utils/types/integer.type';
import { ValidationRuleDefinition } from './interfaces/validation-rule-definition.interface';
import { ValidationRules } from './interfaces/validation-rules.interface';

@Service()
export class Validator {
  private rules: ValidationRuleDefinition[] = [];

  constructor(
    private configurator: Configurator,
    private request: Request,
    private response: Response,
  ) {
    this.rules = [
      {
        name: 'accepted',
        errorMessage: 'Field :field must be accepted',
        validate: (value: string) => {
          return [true, 'true', 'on', 'yes', '1', 1].includes(value);
        },
      },
      {
        name: 'date',
        errorMessage: 'Field :field must be a valid date format',
        validate: (value: Date | string | number) => {
          return (
            (new Date(value) as unknown) !== 'Invalid Date' &&
            !isNaN(new Date(value) as unknown as number)
          );
        },
      },
      {
        name: 'doesntEndWith',
        errorMessage: `Field :field must not end with ':value'`,
        validate: (value: string, fieldName: string, search: string) => {
          return !value.endsWith(search);
        },
      },
      {
        name: 'doesntStartWith',
        errorMessage: `Field :field must not start with ':value'`,
        validate: (value: string, fieldName: string, search: string) => {
          return !value.startsWith(search);
        },
      },
      {
        name: 'endsWith',
        errorMessage: `Field :field must end with ':value'`,
        validate: (value: string, fieldName: string, search: string) => {
          return value.endsWith(search);
        },
      },
      {
        name: 'email',
        errorMessage: `Field :field must be a valid email`,
        validate: (value: string) => {
          const emailRegexp =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          return emailRegexp.test(value);
        },
      },
      {
        name: 'float',
        errorMessage: `Field :field must be a floating point number`,
        validate: (value: number) => {
          return !Number.isInteger(value) && !isNaN(value);
        },
      },
      {
        name: 'in',
        errorMessage: `Field :field must be a value from [:value]`,
        validate: (value: string, fieldName: string, array: string[]) => {
          return array.includes(value);
        },
      },
      {
        name: 'integer',
        errorMessage: `Field :field must be an integer number`,
        validate: (value: number) => {
          return Number.isInteger(value) && !isNaN(value);
        },
      },
      {
        name: 'ip',
        errorMessage: `Field :field must be a valid IP address`,
        validate: (value: string) => {
          return isIP(value);
        },
      },
      {
        name: 'ipv4',
        errorMessage: `Field :field must be a valid IPv4 address`,
        validate: (value: string) => {
          return isIPv4(value);
        },
      },
      {
        name: 'length',
        errorMessage: `Field :field must be a :value characters long`,
        validate: (value: string, fieldName: string, length: Integer) => {
          return value.length === length;
        },
      },
      {
        name: 'lowercase',
        errorMessage: `Field :field must be a lowercased string`,
        validate: (value: string) => {
          return value === value.toLowerCase();
        },
      },
      {
        name: 'max',
        errorMessage: `Field :field must be less than :value`,
        validate: (value: string, fieldName: string, maxValue: number) => {
          return value.length < maxValue;
        },
      },
      {
        name: 'maxOrEqual',
        errorMessage: `Field :field must be less than or equal to :value`,
        validate: (value: string, fieldName: string, maxValue: number) => {
          return value.length <= maxValue;
        },
      },
      {
        name: 'maxLength',
        errorMessage: `Field :field must be shorter than :value characters`,
        validate: (value: string, fieldName: string, length: Integer) => {
          return value.length < length;
        },
      },
      {
        name: 'maxOrEqualLength',
        errorMessage: `Field :field must be shorter than :value characters or equal length`,
        validate: (value: string, fieldName: string, length: Integer) => {
          return value.length <= length;
        },
      },
      {
        name: 'min',
        errorMessage: `Field :field must be greater than :value`,
        validate: (value: string, fieldName: string, maxValue: number) => {
          return value.length > maxValue;
        },
      },
      {
        name: 'minOrEqual',
        errorMessage: `Field :field must be greater than or equal to :value`,
        validate: (value: string, fieldName: string, maxValue: number) => {
          return value.length >= maxValue;
        },
      },
      {
        name: 'minLength',
        errorMessage: `Field :field must be longer than :value characters`,
        validate: (value: string, fieldName: string, length: Integer) => {
          return value.length > length;
        },
      },
      {
        name: 'minOrEqualLength',
        errorMessage: `Field :field must be longer than :value characters or equal length`,
        validate: (value: string, fieldName: string, length: Integer) => {
          return value.length >= length;
        },
      },
      {
        name: 'notIn',
        errorMessage: `Field :field must not be a value from [:value]`,
        validate: (value: string, fieldName: string, array: string[]) => {
          return !array.includes(value);
        },
      },
      {
        name: 'numeric',
        errorMessage: `Field :field must be numeric`,
        validate: (value: number) => {
          return !isNaN(value);
        },
      },
      {
        name: 'otherThan',
        errorMessage: `Field :field must be other than :value`,
        validate: (
          value: string | number,
          fieldName: string,
          search: string | number,
        ) => {
          return value !== search;
        },
      },
      {
        name: 'regexp',
        errorMessage: `Field :field must follow the :value pattern`,
        validate: (value: string, fieldName: string, regexp: RegExp) => {
          return regexp.test(value);
        },
      },
      {
        name: 'required',
        errorMessage: `Field :field is required`,
        validate: (value: string) => {
          return value && value !== '' && value !== null;
        },
      },
      {
        name: 'sameAs',
        errorMessage: `Field :field must be same as :value`,
        validate: (value: string, fieldName: string, secondField: string) => {
          return value === this.request.input(secondField);
        },
      },
      {
        name: 'startsWith',
        errorMessage: `Field :field must start with ':value'`,
        validate: (value: string, fieldName: string, search: string) => {
          return value.startsWith(search);
        },
      },
      {
        name: 'uppercase',
        errorMessage: `Field :field must be an uppercased string`,
        validate: (value: string) => {
          return value.toUpperCase() === value;
        },
      },
      {
        name: 'username',
        errorMessage: `Field :field must be a valid user name`,
        validate: (value: string) => {
          const usernameRegexp = /^[a-z][a-z0-9]*(?:[ _-][a-z0-9]*)*$/iu;

          return usernameRegexp.test(value);
        },
      },
      ...(this.configurator.entries?.validation?.rules ?? []),
    ];
  }

  public $setRequest(request: Request): void {
    this.request = request;
  }

  public $setResponse(response: Response): void {
    this.response = response;
  }

  public assert(rules: Record<string, ValidationRules>, checkOnly = false): boolean {
    const errors: Record<string, string[]> = {};

    for (const [fieldName, ruleSet] of Object.entries(rules)) {
      const fieldValue = this.request.input(fieldName);

      for (const [rule, ruleValue] of Object.entries(ruleSet)) {
        const ruleObject = this.rules.find((ruleData) => ruleData.name === rule);

        if (!ruleObject) {
          throw new Error(`Invalid validation rule '${rule}'`, {
            cause: new Error('Provide a valid validation rule'),
          });
        }

        const passes = ruleObject.validate.apply(this, [
          fieldValue,
          fieldName,
          ruleValue,
        ]);

        if (!passes) {
          if (!(fieldName in errors)) {
            errors[fieldName] = [];
          }

          errors[fieldName].push(
            ruleObject.errorMessage
              .replaceAll(':field', fieldName)
              .replaceAll(
                ':value',
                Array.isArray(ruleValue) ? ruleValue.join(', ') : String(ruleValue),
              ),
          );

          if (checkOnly) {
            return false;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      if (this.request.isAjaxRequest()) {
        this.response.json({ errors });
        this.response.status(StatusCode.BadRequest);

        return false;
      }

      this.response.redirectBack({ errors }, StatusCode.BadRequest);

      return false;
    }

    return true;
  }
}
