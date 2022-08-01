import { ViewResponse } from '../../http/view-response.class';
import { fileURLToPath } from 'node:url';

function getFileCallerURL(): string {
  const error = new Error();
  const stack = error.stack?.split('\n') as string[];
  const data = stack[3];

  const filePathPattern = /(file:[/]{2}.+[^:0-9]):{1}[0-9]+:{1}[0-9]+/;
  const result = filePathPattern.exec(data);

  let filePath: string = '';

  if (result && (result.length > 1)) {
    filePath = result[1];
  }

  return fileURLToPath(filePath);
} 

export const render = (file: string, data?: Record<string, any>): ViewResponse => {
  const callerFile = getFileCallerURL();

  if (file.startsWith('./') || file.startsWith('../')) {
    file = `${callerFile}/${file};`
  }
  console.log(file);

  return new ViewResponse(file, data);
};
