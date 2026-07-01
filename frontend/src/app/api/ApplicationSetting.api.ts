import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../constants";
import { HttpService } from "../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/application-settings`
const endpoints = {
    dropdown: () => `${RESOURCE_ENDPOINT}/dropdown`,
    updateSetting: () => `${RESOURCE_ENDPOINT}`,
}

export default class ApplicationSettingApi {
    public dropdown = (params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.dropdown();
        return HttpService.get(url, params, headers);
    }

    public updateSetting = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.updateSetting();
        return HttpService.post(url, payload, params, headers);
    }

}
