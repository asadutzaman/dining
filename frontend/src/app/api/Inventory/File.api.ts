import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/file`;
const endpoints = {
    getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
    getFileByIds: () => `${RESOURCE_ENDPOINT}/get-multiple-files`,
    upload: () => `${RESOURCE_ENDPOINT}/upload`,
    delete: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
};

export default class FileApi {
    public getFileById = (id: any): AxiosPromise<any> => {
        const url = endpoints.getById(id);
        return HttpService.getFile(url);
    };

    public getFileByIds = (ids: any): AxiosPromise<any> => {
        const url = endpoints.getFileByIds();
        const params = {
            fileIds: ids,
        };
        return HttpService.postFile(url, params);
    };

    public getImageById = (id: any): AxiosPromise<any> => {
        const url = endpoints.getById(id);
        return HttpService.getFile(url);
    };

    public upload = (file: File): AxiosPromise<any> => {
        const url = endpoints.upload();
        return HttpService.upload(url, file);
    };

    public delete = (id: any, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.delete(id);
        return HttpService.delete(url, params, headers);
    };
}
