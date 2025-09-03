import { request, APIRequestContext } from '@playwright/test';
import CONFIG from '../config/config';

/**
 * API Utilities for making API requests and handling responses
 */
export class ApiUtils {
  private context: APIRequestContext;
  private baseUrl: string;
  private headers: Record<string, string>;

  /**
   * Constructor for ApiUtils
   * @param baseUrl Optional base URL override (defaults to config API base URL)
   * @param headers Optional headers to include in all requests
   */
  constructor(baseUrl?: string, headers?: Record<string, string>) {
    this.baseUrl = baseUrl || CONFIG.apiBaseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };
  }

  /**
   * Initialize the API request context
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: this.headers
    });
  }

  /**
   * Set authentication token
   * @param token Authentication token
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Make a GET request
   * @param url URL path
   * @param params Query parameters
   */
  async get(url: string, params?: Record<string, string>): Promise<any> {
    const response = await this.context.get(url, { params });
    return await this.handleResponse(response);
  }

  /**
   * Make a POST request
   * @param url URL path
   * @param data Request body
   */
  async post(url: string, data?: any): Promise<any> {
    const response = await this.context.post(url, {
      data
    });
    return await this.handleResponse(response);
  }

  /**
   * Make a PUT request
   * @param url URL path
   * @param data Request body
   */
  async put(url: string, data?: any): Promise<any> {
    const response = await this.context.put(url, {
      data
    });
    return await this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   * @param url URL path
   */
  async delete(url: string): Promise<any> {
    const response = await this.context.delete(url);
    return await this.handleResponse(response);
  }

  /**
   * Handle API response
   * @param response API response
   */
  private async handleResponse(response: any): Promise<any> {
    if (!response.ok()) {
      throw new Error(`API request failed with status ${response.status()}: ${await response.text()}`);
    }
    
    try {
      return await response.json();
    } catch (error) {
      return await response.text();
    }
  }

  /**
   * Dispose the API request context
   */
  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
