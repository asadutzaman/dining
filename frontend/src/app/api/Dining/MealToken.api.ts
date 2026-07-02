import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/meal-token`
const endpoints = {
    list: () => `${RESOURCE_ENDPOINT}`,
    getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
    create: () => `${RESOURCE_ENDPOINT}`,
    delete: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
    collect: (id: any) => `${RESOURCE_ENDPOINT}/collect/${id}`,
    findByTokenNumber: () => `${RESOURCE_ENDPOINT}/find-by-token-number`,
}

export default class MealTokenApi {
    public list = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.list();
        return HttpService.get(url, params, headers);
    }

    public getById = (id: any): AxiosPromise<any> => {
        const url = endpoints.getById(id);
        return HttpService.get(url);
    }

    public create = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.create();
        return HttpService.post(url, payload, params, headers);
    }

    public delete = (id: any, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.delete(id);
        return HttpService.delete(url, params, headers);
    }

    public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.dropdown();
        return HttpService.get(url, params, headers);
    };

    public collect = (id: any): AxiosPromise<any> => {
        const url = endpoints.collect(id);
        return HttpService.put(url, {});
    };

    public findByTokenNumber = (tokenNumber: string): AxiosPromise<any> => {
        const url = endpoints.findByTokenNumber();
        return HttpService.get(url, { token_number: tokenNumber });
    };
}
