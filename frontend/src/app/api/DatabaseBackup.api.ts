import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../constants";
import { HttpService } from "../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/database-backup`
const endpoints = {
    download: () => `${RESOURCE_ENDPOINT}/download`,
    sendEmail: () => `${RESOURCE_ENDPOINT}/email`,
}

export default class DatabaseBackupApi {
    public download = (params = {}, headers = {}): AxiosPromise<any> => {
        return HttpService.exportFile(endpoints.download(), params, headers);
    }

    public sendEmail = (payload: { email: string }, params = {}, headers = {}): AxiosPromise<any> => {
        return HttpService.post(endpoints.sendEmail(), payload, params, headers);
    }
}
