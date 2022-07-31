import { ViewResponse } from '../../http/view-response.class';

function getFileCallerURL(): string {
  const error = new Error();
  const stack = error.stack?.split('\n') as string[];
  const data: string = stack[3];

  const filePathPattern = new RegExp(`(file:[/]{2}.+[^:0-9]):{1}[0-9]+:{1}[0-9]+`);
  const result = filePathPattern.exec(data);

  let filePath: string = '';

  if (result && (result.length > 1)) {
    filePath = result[1];
  }

  return filePath;
} 

export const render = (file: string, data?: Record<string, any>): ViewResponse => {
  const callerFile = getFileCallerURL();
  console.log(callerFile);

  return new ViewResponse(file, data);
};
