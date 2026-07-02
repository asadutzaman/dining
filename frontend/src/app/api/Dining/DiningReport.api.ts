import { AxiosPromise } from "axios";
import { CONSTANT_CONFIG } from "../../constants";
import { HttpService } from "../../services/http.services";

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/report/dining`
const endpoints = {
    monthly: () => `${RESOURCE_ENDPOINT}/monthly`,
    monthlyExport: () => `${RESOURCE_ENDPOINT}/monthly-export`,
    individual: () => `${RESOURCE_ENDPOINT}/individual`,
    individualExport: () => `${RESOURCE_ENDPOINT}/individual-export`,
    mealCost: () => `${RESOURCE_ENDPOINT}/meal-cost`,
    mealCostExport: () => `${RESOURCE_ENDPOINT}/meal-cost-export`,
}

export default class DiningReportApi {
    public getMonthlySummary = (params: any = {}): AxiosPromise<any> => {
        return HttpService.get(endpoints.monthly(), params);
    }

    public getMonthlySummaryExport = (params: any = {}): AxiosPromise<any> => {
        return HttpService.exportFile(endpoints.monthlyExport(), params);
    }

    public getIndividualStatement = (params: any = {}): AxiosPromise<any> => {
        return HttpService.get(endpoints.individual(), params);
    }

    public getIndividualStatementExport = (params: any = {}): AxiosPromise<any> => {
        return HttpService.exportFile(endpoints.individualExport(), params);
    }

    public getMealCostSummary = (params: any = {}): AxiosPromise<any> => {
        return HttpService.get(endpoints.mealCost(), params);
    }

    public getMealCostSummaryExport = (params: any = {}): AxiosPromise<any> => {
        return HttpService.exportFile(endpoints.mealCostExport(), params);
    }
}
