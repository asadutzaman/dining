import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/enum`
const endpoints = {
    list: () => `${RESOURCE_ENDPOINT}`,
    getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
    dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
}

export default class EnumApi {
    public list = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.list();
        return HttpService.get(url, params, headers);
    }

    public getById = (id: any): AxiosPromise<any> => {
        const url = endpoints.getById(id);
        return HttpService.get(url);
    }

    public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.dropdown();
        return HttpService.get(url, params, headers);
    };
}