import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/member`
const endpoints = {
    list: () => `${RESOURCE_ENDPOINT}`,
    getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
    create: () => `${RESOURCE_ENDPOINT}`,
    update: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    updatePartial: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    delete: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
    findByCard: () => `${RESOURCE_ENDPOINT}/find-by-card`,
    bulkImport: () => `${RESOURCE_ENDPOINT}/bulk-import`,
    candidateList: () => `${RESOURCE_ENDPOINT}/candidate`,
}

export default class MemberApi {
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

    public update = (id: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.update(id);
        return HttpService.put(url, payload, params, headers);
    }

    public updatePartial = (id: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.updatePartial(id);
        return HttpService.patch(url, payload, params, headers);
    }

    public delete = (id: any, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.delete(id);
        return HttpService.delete(url, params, headers);
    }

    public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.dropdown();
        return HttpService.get(url, params, headers);
    };

    public findByCard = (rfidCardNumber: string): AxiosPromise<any> => {
        const url = endpoints.findByCard();
        return HttpService.get(url, { rfid_card_number: rfidCardNumber });
    };

    public bulkImport = (file: File): Promise<any> => {
        const url = endpoints.bulkImport();
        return HttpService.upload(url, file);
    };

    public candidateList = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.candidateList();
        return HttpService.get(url, params, headers);
    };
}
