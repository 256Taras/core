import { Service } from '../injector/decorators/service.decorator';
import { HttpMethod } from './enums/http-method.enum';

@Service()
export class HttpClient {
  private async fetch(
    url: string,
    data: Record<string, any>,
    headers: Record<string, string>,
    method: HttpMethod,
  ): Promise<any | null> {
    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
      }

      const response: Response = await fetch(url, {
        method,
        headers,
        ...(![HttpMethod.Get, HttpMethod.Head].includes(method) && {
          body: formData,
        }),
      });

      return response.json();
    } catch (error) {
      return null;
    }
  }

  public async delete<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Delete);

    return response as T | null;
  }

  public async get<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Get);

    return response as T | null;
  }

  public async options<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Options);

    return response as T | null;
  }

  public async patch<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Patch);

    return response as T | null;
  }

  public async post<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Post);

    return response as T | null;
  }

  public async put<T = any>(
    url: string,
    data: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch(url, data, headers, HttpMethod.Put);

    return response as T | null;
  }
}
