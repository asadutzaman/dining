import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/permission`
const endpoints = {
    list: () => `${RESOURCE_ENDPOINT}`,
    getById: (id: any) => `${RESOURCE_ENDPOINT}/${id}`,
    create: () => `${RESOURCE_ENDPOINT}`,
    update: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    updatePartial: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    delete: (id: Number) => `${RESOURCE_ENDPOINT}/${id}`,
    checkResourcePermission: () => `${RESOURCE_ENDPOINT}/check-resource-permission`,
    savePermission: () => `${RESOURCE_ENDPOINT}/save-permission`,
    rolePermission: (roleId: any) => `${RESOURCE_ENDPOINT}/role-permission/${roleId}`,
    userPermission: (userId: any) => `${RESOURCE_ENDPOINT}/user-permission/${userId}`,
    dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
}

export default class PermissionApi {
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

    public checkResourcePermission = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.checkResourcePermission();
        return HttpService.post(url, payload, params, headers);
    }

    public savePermission = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.savePermission();
        return HttpService.post(url, payload, params, headers);
    }

    public rolePermission = (roleId: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.rolePermission(roleId);
        return HttpService.post(url, payload, params, headers);
    }

    public userPermission = (userId: any, payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.userPermission(userId);
        return HttpService.post(url, payload, params, headers);
    }

    public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.dropdown();
        return HttpService.get(url, params, headers);
    }
}