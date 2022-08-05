import { Method } from './enums/method.enum';

export class HttpClient {
  private async fetch(
    url: string,
    data: BodyInit | null,
    headers: Record<string, string>,
    method: Method,
  ): Promise<any> {
    const response: Response = await fetch(url, {
      method,
      headers,
      body: data,
    });

    return response.json();
  }

  public async delete(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Delete);

    return response;
  }

  public async get(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Get);

    return response;
  }

  public async options(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Options);

    return response;
  }

  public async patch(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Patch);

    return response;
  }

  public async post(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Post);

    return response;
  }

  public async put(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const response = await this.fetch(url, data, headers, Method.Put);

    return response;
  }
}
