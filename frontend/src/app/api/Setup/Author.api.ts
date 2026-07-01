import {AxiosPromise} from 'axios'
import {CONSTANT_CONFIG} from '../../constants'
import {HttpService} from '../../services/http.services'

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/author`
const endpoints = {
  list: () => `${RESOURCE_ENDPOINT}`,
  getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
  create: () => `${RESOURCE_ENDPOINT}`,
  update: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
  updatePartial: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
  delete: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
  bulk: () => `${RESOURCE_ENDPOINT}/bulk`,
  dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
}

export default class AuthorApi {
  public list = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.list()
    return HttpService.get(url, params, headers)
  }

  public getById = (id: any): AxiosPromise<any> => {
    const url = endpoints.getById(id)
    return HttpService.get(url)
  }

  public create = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.create()
    return HttpService.post(url, payload, params, headers)
  }

  public update = (id: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.update(id)
    return HttpService.put(url, payload, params, headers)
  }

  public updatePartial = (id: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.updatePartial(id)
    return HttpService.patch(url, payload, params, headers)
  }

  public delete = (id: any, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.delete(id)
    return HttpService.delete(url, params, headers)
  }

  public bulk = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.bulk()
    return HttpService.post(url, payload, params, headers)
  }

  public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.dropdown()
    return HttpService.get(url, params, headers)
  }
}
