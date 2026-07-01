import {
  SET_LOADING,
  SET_ERROR,
  LOADED_SCOPE,
  CLEAR_ALL_AUTH_STATE,
  LOADED_AUTH_STATE,
  CLEAR_AUTH_STATE,
  LOADED_TOKEN,
  REMOVE_TOKEN,
} from './auth.types'
import {StorageService} from '../../services'

export default (state: any, action: any) => {
  switch (action.type) {
    case LOADED_AUTH_STATE:
      return {
        ...state,
        isAuthReady: true,
        isAuthenticated: action.payload.isAuthenticated,
        isAdmin: action.payload.isAdmin,
        isUser: action.payload.isUser,
        user: action.payload.user,
        userId: action.payload.userId,
        userName: action.payload.userName,
        userEmail: action.payload.userEmail,
        userType: action.payload.userType,
        departmentId: action.payload.departmentId,
        designationId: action.payload.designationId,
        branchId: action.payload.branchId,
        branchName: action.payload.branchName,
        logisticId: action.payload.logisticId,

        profileId: action.payload.profileId,
        profileNameEn: action.payload.profileNameEn,
        profileNameBn: action.payload.profileNameBn,
        profileType: action.payload.profileType,
        profileImage: action.payload.profileImage,
        roleIds: action.payload.roleIds,
        roleNameList: action.payload.roleNameList,
        roleCodeList: action.payload.roleCodeList,
        organogramId: action.payload.organogramId,
        organogramIds: action.payload.organogramIds,
        organogramNameEn: action.payload.organogramNameEn,
        organogramNameBn: action.payload.organogramNameBn,
        organizationId: action.payload.organizationId,
        organizationIds: action.payload.organizationIds,
        organizationNameEn: action.payload.organizationNameEn,
        organizationNameBn: action.payload.organizationNameBn,
        loading: false,
        error: false,
      }

    case LOADED_SCOPE:
      return {
        ...state,
        scopes: action.payload.scopes,
      }

    case LOADED_TOKEN:
      StorageService.setAccessToken(action.payload.accessToken)
      StorageService.setRefreshToken(action.payload.refreshToken)
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      }

    case REMOVE_TOKEN:
      StorageService.removeAccessToken()
      StorageService.removeRefreshToken()
      return {
        ...state,
        isAuthReady: true,
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        accessToken: null,
        refreshToken: null,
      }

    case CLEAR_AUTH_STATE:
      return {
        ...state,
        isAuthReady: true,
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        user: null,
        userId: null,
        scopes: null,
        loading: false,
        error: null,
      }

    case CLEAR_ALL_AUTH_STATE:
      return {
        ...state,
        isAuthReady: true,
        isAuthenticated: false,
        isAdmin: false,
        isUser: false,
        user: null,
        userId: null,
        userName: null,
        userEmail: null,
        userType: null,
        departmentId: null,
        designationId: null,
        branchId: null,
        branchName: null,
        logisticId: null,

        profileId: null,
        profileNameEn: null,
        profileNameBn: null,
        profileType: null,
        profileImage: null,
        roleIds: null,
        roleNameList: null,
        roleCodeList: null,
        scopes: null,
        organogramId: null,
        organogramIds: null,
        organogramNameEn: null,
        organogramNameBn: null,
        organizationId: null,
        organizationIds: null,
        organizationNameEn: null,
        organizationNameBn: null,
        loading: false,
        error: null,
      }

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      }

    case SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
      }

    default:
      return state
  }
}
