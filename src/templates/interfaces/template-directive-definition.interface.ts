export interface TemplateDirectiveDefinition {
  name: string;
  type: 'single' | 'double' | 'block';
  pattern?: RegExp;
  handler: Function;
}
