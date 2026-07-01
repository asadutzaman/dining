import {AxiosPromise} from 'axios'
import {CONSTANT_CONFIG} from '../../constants'
import {HttpService} from '../../services/http.services'

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/report`
const endpoints = {
  // REQUISITION ANALYTIC
  getRequisitionAnalyticReport: () => `${RESOURCE_ENDPOINT}/requisition-analytic`,
  getRequisitionAnalyticReportExport: () => `${RESOURCE_ENDPOINT}/requisition-analytic-export`,
  // ITEM STOCK
  getItemStockReport: () => `${RESOURCE_ENDPOINT}/item-stock`,
  getItemStockReportExport: () => `${RESOURCE_ENDPOINT}/item-stock-export`,
  // ITEM LOW STOCK
  getItemLowStockReport: () => `${RESOURCE_ENDPOINT}/item-low-stock`,
  getItemLowStockReportExport: () => `${RESOURCE_ENDPOINT}/item-low-stock-export`,
  // ITEM REQUISITION STATUS
  getItemRequisitionStatusReport: () => `${RESOURCE_ENDPOINT}/item-requisition-status`,
  getItemRequisitionStatusReportExport: () => `${RESOURCE_ENDPOINT}/item-requisition-status-export`,
  // REQUISITION ANALYTIC
  getRequesterWiseDisbursementReport: () => `${RESOURCE_ENDPOINT}/requester-wise-disbursement`,
  getRequesterWiseDisbursementReportExport: () =>
    `${RESOURCE_ENDPOINT}/requester-wise-disbursement-export`,
  // ITEM WISE DISBURSEMENT
  getItemWiseDisbursementReport: () => `${RESOURCE_ENDPOINT}/item-wise-disbursement`,
  getItemWiseDisbursementReportExport: () => `${RESOURCE_ENDPOINT}/item-wise-disbursement-export`,
  // THANAWISE DISBURSEMENT
  getThanaWiseDisbursementReport: () => `${RESOURCE_ENDPOINT}/branch-wise-disbursement`,
  getThanaWiseDisbursementReportExport: () =>
    `${RESOURCE_ENDPOINT}/branch-wise-disbursement-export`,
}

export default class ReportScmApi {
  // REQUISITION ANALYTIC
  public getRequisitionAnalyticReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getRequisitionAnalyticReport()
    return HttpService.get(url, params, headers)
  }
  public getRequisitionAnalyticReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getRequisitionAnalyticReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // ITEM STOCK
  public getItemStockReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemStockReport()
    return HttpService.get(url, params, headers)
  }
  public getItemStockReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemStockReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // ITEM LOW STOCK
  public getItemLowStockReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemLowStockReport()
    return HttpService.get(url, params, headers)
  }
  public getItemLowStockReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemLowStockReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // ITEM REQUISITION STATUS
  public getItemRequisitionStatusReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemRequisitionStatusReport()
    return HttpService.get(url, params, headers)
  }
  public getItemRequisitionStatusReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemRequisitionStatusReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // REQUISITION ANALYTIC
  public getRequesterWiseDisbursementReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getRequesterWiseDisbursementReport()
    return HttpService.get(url, params, headers)
  }
  public getRequesterWiseDisbursementReportExport = (
    params = {},
    headers = {}
  ): AxiosPromise<any> => {
    const url = endpoints.getRequesterWiseDisbursementReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // ITEM WISE DISBURSEMENT
  public getItemWiseDisbursementReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemWiseDisbursementReport()
    return HttpService.get(url, params, headers)
  }
  public getItemWiseDisbursementReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getItemWiseDisbursementReportExport()
    return HttpService.exportFile(url, params, headers)
  }
  // THANAWISE DISBURSEMENT
  public getThanaWiseDisbursementReport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getThanaWiseDisbursementReport()
    return HttpService.get(url, params, headers)
  }
  public getThanaWiseDisbursementReportExport = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getThanaWiseDisbursementReportExport()
    return HttpService.exportFile(url, params, headers)
  }
}
