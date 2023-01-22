export interface TemplateDirectiveDefinition {
  name: string;
  type: 'single' | 'double';
  pattern?: RegExp;
  handler: (...args: unknown[]) => string;
}
