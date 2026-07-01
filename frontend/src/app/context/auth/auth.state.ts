const initialState = {
  loading: true,
  isLoaded: false,
  isAuthenticated: null,
  isAdmin: null,
  isUser: null,
  isAuthReady: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  user: null,
  userId: null,
  userName: null,
  userEmail: null,
  userType: null,

  profileId: null,
  profileNameEn: null,
  profileNameBn: null,
  profileType: null,
  profileImage: null,

  departmentId: null,
  designationId: null,
  branchId: null,
  branchName: null,
  logisticId: null,

  groupIds: [] as any,
  groupNameList: [] as any,
  groupCodeList: [] as any,

  roleIds: [] as any,
  roleNameList: [] as any,
  roleCodeList: [] as any,

  organogramId: null,
  organogramIds: [] as any,
  organogramNameEn: null,
  organogramNameBn: null,

  organizationId: null,
  organizationIds: [] as any,
  organizationNameEn: null,
  organizationNameBn: null,
  accessWorkflowList: [] as string[],

  scopes: [] as any,
  error: null,

  dispatchAuth: (action: any) => null,
  loadAuthState: (token?: any) => null,
  clearAuthState: () => null,
  setLoading: (isShow: any) => null,
}

export default initialState
