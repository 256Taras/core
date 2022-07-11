export const Controller = (baseUrl?: string): any => {
  return (target: any) => {
    return class extends target {
      public baseUrl = baseUrl;
    };
  };
};
