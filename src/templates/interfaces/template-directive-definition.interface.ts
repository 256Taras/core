export interface TemplateDirectiveDefinition {
  name: string;
  type: 'single' | 'double' | 'block';
  pattern?: RegExp;
  render: Function;
}
