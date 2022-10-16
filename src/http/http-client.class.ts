import { Service } from '../injector/decorators/service.decorator';
import { HttpMethod } from './enums/http-method.enum';

@Service()
export class HttpClient {
  private async fetch<T>(
    url: string,
    data: Record<string, string | Blob>,
    headers: Record<string, string>,
    method: HttpMethod,
  ): Promise<T | null> {
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

  public async delete<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Delete);

    return response;
  }

  public async get<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Get);

    return response;
  }

  public async options<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Options);

    return response;
  }

  public async patch<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Patch);

    return response;
  }

  public async post<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Post);

    return response;
  }

  public async put<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    const response = await this.fetch<T>(url, data, headers, HttpMethod.Put);

    return response;
  }
}
