import { Method } from './enums/method.enum';

export class HttpClient {
  private async fetch(
    url: string,
    data: Record<string, any>,
    headers: Record<string, string>,
    method: Method,
  ): Promise<any> {
    const response: Response = await fetch(url, {
      method,
      headers,
      data,
    });

    return response.json();
  }

  public async delete(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Delete);

    return response;
  }

  public async get(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Get);

    return response;
  }

  public async options(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Options);

    return response;
  }

  public async patch(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Patch);

    return response;
  }

  public async post(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Post);

    return response;
  }

  public async put(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Put);

    return response;
  }
}
