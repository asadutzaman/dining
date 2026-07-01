import {AxiosPromise} from 'axios'
import {CONSTANT_CONFIG} from '../constants'
import {HttpService} from '../services/http.services'

const RESOURCE_ENDPOINT = `${CONSTANT_CONFIG.SERVER_PREFIX}/oauth`
const endpoints = {
  loadGlobalState: () => `${RESOURCE_ENDPOINT}/load-global-state`,
  loadAuthState: () => `${RESOURCE_ENDPOINT}/load-auth-state`,
  loadUserScopes: () => `${RESOURCE_ENDPOINT}/load-user-scopes`,
  loadProfileState: () => `${RESOURCE_ENDPOINT}/load-profile-state`,
  login: () => `${RESOURCE_ENDPOINT}/login`,
  checkValidLoginInfo: () => `${RESOURCE_ENDPOINT}/check-valid-login-info`,
  switchLoginOrganization: () => `${RESOURCE_ENDPOINT}/switch-login-organization`,
  register: () => `${RESOURCE_ENDPOINT}/register`,
  verifyUserEmail: () => `${RESOURCE_ENDPOINT}/verify-email`,
  forgotPassword: () => `${RESOURCE_ENDPOINT}/forgot-password`,
  resetPassword: () => `${RESOURCE_ENDPOINT}/reset-password`,
  changePassword: () => `${RESOURCE_ENDPOINT}/change-password`,
  logout: () => `${RESOURCE_ENDPOINT}/logout`,
  refreshToken: () => `${RESOURCE_ENDPOINT}/token/refresh`,
  invitePeople: () => `${RESOURCE_ENDPOINT}/invite-people`,
  validateIdTokenAndGenerateAccessToken: () =>
    `${RESOURCE_ENDPOINT}/validate-id-token-and-generate-access-token`,
  otp: () => `${RESOURCE_ENDPOINT}/send-otp`,
  passwordPattern: () => `${RESOURCE_ENDPOINT}/password-pattern`,
  getCaptcha: () => `${RESOURCE_ENDPOINT}/getCaptcha`,
  dashboardStats: () => `${RESOURCE_ENDPOINT}/dashboard-stats`,
}

export default class OauthApi {
  public loadGlobalState = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.loadGlobalState()
    return HttpService.post(url, payload, params, headers)
  }

  public loadAuthState = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.loadAuthState()
    return HttpService.post(url, payload, params, headers)
  }

  public loadUserScopes = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.loadUserScopes()
    return HttpService.post(url, payload, params, headers)
  }

  public loadProfileState = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.loadProfileState()
    return HttpService.post(url, payload, params, headers)
  }

  public login = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.login()
    return HttpService.post(url, payload, params, headers)
  }

  public checkValidLoginInfo = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.checkValidLoginInfo()
    return HttpService.post(url, payload, params, headers)
  }

  public switchLoginOrganization = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.switchLoginOrganization()
    return HttpService.post(url, payload, params, headers)
  }

  public register = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.register()
    return HttpService.post(url, payload, params, headers)
  }

  public verifyUserEmail = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.verifyUserEmail()
    return HttpService.post(url, payload, params, headers)
  }

  public forgotPassword = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.forgotPassword()
    return HttpService.post(url, payload, params, headers)
  }

  public resetPassword = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.resetPassword()
    return HttpService.post(url, payload, params, headers)
  }

  public changePassword = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.changePassword()
    return HttpService.post(url, payload, params, headers)
  }

  public logout = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.logout()
    return HttpService.post(url, payload, params, headers)
  }

  public refreshToken = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.refreshToken()
    return HttpService.post(url, payload, params, headers)
  }

  public invitePeople = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.invitePeople()
    return HttpService.post(url, payload, params, headers)
  }

  public validateIdTokenAndGenerateAccessToken = (
    payload = {},
    params = {},
    headers = {}
  ): AxiosPromise<any> => {
    const url = endpoints.validateIdTokenAndGenerateAccessToken()
    return HttpService.post(url, payload, params, headers)
  }

  public otp = (payload = {}, params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.otp()
    return HttpService.post(url, payload, params, headers)
  }

  public passwordPattern = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.passwordPattern()
    return HttpService.get(url, params, headers)
  }

  public getCaptcha = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.getCaptcha()
    return HttpService.get(url, params, headers)
  }

  public dashboardStats = (params = {}, headers = {}): AxiosPromise<any> => {
    const url = endpoints.dashboardStats()
    return HttpService.get(url, params, headers)
  }
}
