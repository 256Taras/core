export namespace Route {
  export const Get = (url: string): (target: any, controllerMethod: string) => void => {
    return (target: any, controllerMethod: string) => {
      console.log('route');
    };
  };
}
