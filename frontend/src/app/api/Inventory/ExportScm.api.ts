import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/export`
const endpoints = {
    exportExampleReport: () => `${RESOURCE_ENDPOINT}/example-report`,
    exportItemStockReport: () => `${RESOURCE_ENDPOINT}/item-stock`,
    exportJobCostingReport: () => `${RESOURCE_ENDPOINT}/job-costing`,

}

export default class ExportScmApi {
    public exportExampleReport = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.exportExampleReport();
        return HttpService.post(url, payload, params, headers);
    }
    public exportItemStockReport = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.exportItemStockReport();
        return HttpService.post(url, payload, params, headers);
    }
    public exportJobCostingReport = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
        const url = endpoints.exportJobCostingReport();
        return HttpService.post(url, payload, params, headers);
    }
}
