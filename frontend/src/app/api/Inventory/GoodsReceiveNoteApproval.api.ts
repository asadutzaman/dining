import {AxiosPromise} from 'axios'
import {CONSTANT_CONFIG} from '../../constants'
import {HttpService} from '../../services/http.services'

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/approval-goods-receive-note`
const endpoints = {
  list: () => `${RESOURCE_ENDPOINT}`,
  getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
}

export default class GoodsReceiveNoteApprovalApi {
  public list = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.list()
    return HttpService.get(url, params, headers)
  }

  public getById = (id: any): AxiosPromise<any> => {
    const url = endpoints.getById(id)
    return HttpService.get(url)
  }
}
