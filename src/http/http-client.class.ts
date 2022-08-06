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

  public async delete<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Delete);

    return response as T;
  }

  public async get<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Get);

    return response as T;
  }

  public async options<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Options);

    return response as T;
  }

  public async patch<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Patch);

    return response as T;
  }

  public async post<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Post);

    return response as T;
  }

  public async put<T = any>(
    url: string,
    data: BodyInit | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await this.fetch(url, data, headers, Method.Put);

    return response as T;
  }
}
