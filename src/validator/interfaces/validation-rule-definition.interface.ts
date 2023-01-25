export interface ValidationRuleDefinition {
  name: string;
  errorMessage: string;
  validate: Function;
}
