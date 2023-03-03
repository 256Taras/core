import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { HttpMethod } from './enums/http-method.enum.js';
import { Request } from './request.service.js';

@Service()
export class HttpClient {
  private readonly request = inject(Request);

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
        ...(this.request.isFormRequest() && {
          body: formData,
        }),
      });

      return response.json();
    } catch {
      return null;
    }
  }

  public async delete<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Delete);
  }

  public async get<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Get);
  }

  public async options<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Options);
  }

  public async patch<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Patch);
  }

  public async post<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Post);
  }

  public async put<T>(
    url: string,
    data: Record<string, string | Blob> = {},
    headers: Record<string, string> = {},
  ): Promise<T | null> {
    return await this.fetch<T>(url, data, headers, HttpMethod.Put);
  }
}
