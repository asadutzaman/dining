import axios, {
  AxiosRequestConfig,
  AxiosPromise,
  AxiosResponse,
  AxiosError,
} from 'axios';
import _StorageService from './storage.service';
import { CONSTANT_CONFIG } from '../constants';
import { BASE_URL } from '../constants/config.constant';
const StorageService = new _StorageService();

type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

interface Request {
  method: RequestMethod;
  url: string;
  queryString?: string;
  params?: any;
  headers?: any;
  body?: any;
  responseType?: any;
}

class _HttpService {
  private httpClient;

  private baseURL = CONSTANT_CONFIG.API_SERVER_URL;

  private timeout = 180000; // 20000

  private headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: '',
  };

  private static instance: _HttpService;

  static getInstance() {
    if (!_HttpService.instance) {
      _HttpService.instance = new _HttpService();
    }
    return _HttpService.instance;
  }

  constructor(baseURL: string = '') {
    this.baseURL = baseURL ? baseURL : this.baseURL;
    this.httpClient = axios.create();
    this.httpClient.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleError(error)
    );

    const accessToken = StorageService.getAccessToken();
    this.setAccessToken(accessToken);
  }

  private request(req: Request): AxiosPromise<any> {
    const axiosConfig: AxiosRequestConfig = {
      url: this.baseURL + req.url,
      method: req.method,
      responseType: req.responseType ? req.responseType : 'json',
      params: req.params,
      data: req.body,
      headers: { ...this.headers, ...req.headers },
      timeout: this.timeout,
    };
    return this.httpClient.request(axiosConfig);
  }

  public setAccessToken = (token: any) => {
    this.headers.Authorization = token ? `Bearer ${token}` : '';
  };

  public clearAccessToken = () => {
    this.headers.Authorization = '';
  };

  public get(url: string, params = {}, headers = {}): AxiosPromise<any> {
    return this.request({
      method: 'GET',
      url: url,
      params: params,
      headers: headers,
    });
  }

  public post(
    url: string,
    payload = {},
    params = {},
    headers = {}
  ): AxiosPromise<any> {
    return this.request({
      method: 'POST',
      url: url,
      params: params,
      body: payload,
      headers: headers,
    });
  }

  public put(
    url: string,
    payload = {},
    params = {},
    headers = {}
  ): AxiosPromise<any> {
    return this.request({
      method: 'PUT',
      url: url,
      params: params,
      body: payload,
      headers: headers,
    });
  }

  public patch(
    url: string,
    payload = {},
    params = {},
    headers = {}
  ): AxiosPromise<any> {
    return this.request({
      method: 'PATCH',
      url: url,
      params: params,
      body: payload,
      headers: headers,
    });
  }

  public delete(url: string, params = {}, headers = {}): AxiosPromise<any> {
    return this.request({
      method: 'DELETE',
      url: url,
      params: params,
      headers: headers,
    });
  }

  public head(url: string, params = {}, headers = {}): AxiosPromise<any> {
    return this.request({
      method: 'HEAD',
      url: url,
      params: params,
      headers: headers,
    });
  }

  public options(url: string, params = {}, headers = {}): AxiosPromise<any> {
    return this.request({
      method: 'OPTIONS',
      url: url,
      params: params,
      headers: headers,
    });
  }

  public fetch(uri: string, params = {}, headers = {}): Promise<any> {
    let url = this.baseURL + uri;
    return fetch(url, {
      method: 'GET',
      headers: { ...this.headers },
    });
  }

  public async upload(url: string, file: File): Promise<any> {
    const headers = { ...this.headers };
    // @ts-ignore
    delete headers['Content-Type'];
    const formData = new FormData();
    formData.append('file', file);
    const params = {};
    return this.request({
      method: 'POST',
      url: url,
      params: params,
      body: formData,
      headers: headers,
    });
  }

  public async getImage(url: string): Promise<any> {
    const headers = { ...this.headers };
    return this.request({ method: 'GET', url: url, headers: headers });
  }

  public async getFile(url: string): Promise<any> {
    const headers = { ...this.headers };
    return this.request({
      method: 'GET',
      url: url,
      responseType: 'json',
      headers: headers,
    });
  }

  public async postFile(url: string, payload = {}): Promise<any> {
    const headers = { ...this.headers };
    return this.request({
      method: 'POST',
      url: url,
      responseType: 'json',
      headers: headers,
      body: payload,
    });
  }

  public exportFile(url: string, params = {}, headers = {}): AxiosPromise<any> {
    return this.request({
      method: 'GET',
      url: url,
      params: params,
      responseType: 'arraybuffer',
      headers: headers,
    });
  }

  private handleResponse(response: AxiosResponse) {
    // @ts-ignore
    if (response?.data?.data) {
      // @ts-ignore
      response.data = response.data.data;
    }

    // this.refreshToken();
    return response;
  }

  private handleError(error: any) {
    /*if (error.response.status === 401) {
            StorageService.removeAccessToken();
            // @ts-ignore
            window.location.href = `${BASE_URL}/en/auth/login`;
        }*/
    // console.error(error);
    throw error.response;
  }

  private refreshToken = () => {
    let accessToken = StorageService.getAccessToken();

    // Token not found
    if (!accessToken) {
      this.refreshAccessToken();
    }

    // Token expired - refresh it
    const currentTime = Date.now();
    const expiredTime = Number(StorageService.getAccessTokenExpiredTime()) || 0;
    if (currentTime >= expiredTime) {
      this.refreshAccessToken();
    }
  };

  private refreshAccessToken = async () => {
    try {
      const accessToken = StorageService.getAccessToken();
      const refreshToken = StorageService.getRefreshToken();
      if (!refreshToken) {
        throw 'Failed to refresh access token, user needs to login again';
      }

      const apiUrl =
        this.baseURL + `${CONSTANT_CONFIG.SERVER_PREFIX}/oauth/token/refresh`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const result = await res.json();
      StorageService.setAccessToken(result.data.access_token);
      StorageService.setRefreshToken(result.data.refresh_token);
      StorageService.setAccessTokenExpiredTime();

      this.setAccessToken(result.data.access_token);
    } catch (err) {
      // console.log(err);
    }
  };
}

export const HttpService = _HttpService.getInstance();
