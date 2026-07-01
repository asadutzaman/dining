import _ApplicationSettingApi from './ApplicationSetting.api'
import _FackApi from './Fack.api'
import _OauthApi from './Oauth.api'
// SETTING
import _GroupApi from './Setting/Group.api'
import _OrganizationApi from './Setting/Organization.api'
import _OrganogramApi from './Setting/Organogram.api'
import _PermissionApi from './Setting/Permission.api'
import _ResourceApi from './Setting/Resource.api'
import _RoleApi from './Setting/Role.api'
import _ScopeApi from './Setting/Scope.api'
import _UnitApi from './Setting/Unit.api'
import _ApproverGroupApi from './Setting/ApproverGroup.api'
import _UserApi from './Setting/User.api'
import _WorkflowApi from './Setting/Workflow.api'
import _WorkflowStepApi from './Setting/WorkflowStep.api'
// SETUP
import _DepartmentApi from './Setup/Department.api'
import _DesignationApi from './Setup/Designation.api'
import _RequisitionItemLimitApi from './Setup/RequisitionItemLimit.api'
import _SupplierApi from './Setup/Supplier.api'
import _EnumApi from './Setup/Enum.api'
import _BrandApi from './Setup/Brand.api'
import _ItemModelApi from './Setup/ItemModel.api'
import _AuthorApi from './Setup/Author.api'
import _PublisherApi from './Setup/Publisher.api'
import _BranchApi from './Setup/Branch.api'
import _ShelveApi from './Setup/Shelve.api'
import _LogisticApi from './Setup/Logistic.api'
import _AttributeApi from './Setup/Attribute.api'
import _AttributeValueApi from './Setup/AttributeValue.api'
import _ItemApi from './Setup/Item.api'
import _ItemCategoryApi from './Setup/ItemCategory.api'
import _GovtHolidayApi from './Setup/GovtHoliday.api'
// INVENTORY
import _FileApi from './Inventory/File.api'
import _RequisitionApi from './Inventory/Requisition.api'
import _RequisitionApprovalApi from './Inventory/RequisitionApproval.api'
import _GoodsReceiveNoteApi from './Inventory/GoodsReceiveNote.api'
import _GoodsReceiveNoteApprovalApi from './Inventory/GoodsReceiveNoteApproval.api'
import _StockAdjustmentApi from './Inventory/StockAdjustment.api'
import _StockAdjustmentApprovalApi from './Inventory/StockAdjustmentApproval.api'
import _WorkflowTransitionApi from './Inventory/WorkflowTransition.api'
import _ItemConsumptionApi from './Inventory/ItemConsumption.api'
import _StockTransferApi from './Inventory/StockTransfer.api'
import _StockTransferApprovalApi from './Inventory/StockTransferApproval.api'
// Report
import _ReportInvApi from './Inventory/ReportInv.api'
// PATIENT
import _PatientApi from './Patient/Patient.api'

export const FackApi = new _FackApi()
export const OauthApi = new _OauthApi()
export const ApplicationSettingApi = new _ApplicationSettingApi()
// SETTING
export const ResourceApi = new _ResourceApi()
export const ScopeApi = new _ScopeApi()
export const RoleApi = new _RoleApi()
export const GroupApi = new _GroupApi()
export const OrganizationApi = new _OrganizationApi()
export const OrganogramApi = new _OrganogramApi()
export const UserApi = new _UserApi()
export const PermissionApi = new _PermissionApi()
export const UnitApi = new _UnitApi()
export const ApproverGroupApi = new _ApproverGroupApi()
export const WorkflowApi = new _WorkflowApi()
export const WorkflowStepApi = new _WorkflowStepApi()
export const GovtHolidayApi = new _GovtHolidayApi()
// SETUP
export const EnumApi = new _EnumApi()
export const DepartmentApi = new _DepartmentApi()
export const DesignationApi = new _DesignationApi()
export const RequisitionItemLimitApi = new _RequisitionItemLimitApi()
export const SupplierApi = new _SupplierApi()
export const ItemCategoryApi = new _ItemCategoryApi()
export const BrandApi = new _BrandApi()
export const ItemModelApi = new _ItemModelApi()
export const AuthorApi = new _AuthorApi()
export const PublisherApi = new _PublisherApi()
export const BranchApi = new _BranchApi()
export const ShelveApi = new _ShelveApi()
export const LogisticApi = new _LogisticApi()
export const AttributeApi = new _AttributeApi()
export const AttributeValueApi = new _AttributeValueApi()
export const ItemApi = new _ItemApi()
export const WorkflowTransitionApi = new _WorkflowTransitionApi()
// INVENTORY
export const FileApi = new _FileApi()
export const RequisitionApi = new _RequisitionApi()
export const RequisitionApprovalApi = new _RequisitionApprovalApi()
export const GoodsReceiveNoteApi = new _GoodsReceiveNoteApi()
export const GoodsReceiveNoteApprovalApi = new _GoodsReceiveNoteApprovalApi()
export const StockAdjustmentApi = new _StockAdjustmentApi()
export const StockAdjustmentApprovalApi = new _StockAdjustmentApprovalApi()
export const ItemConsumptionApi = new _ItemConsumptionApi()
export const StockTransferApi = new _StockTransferApi()
export const StockTransferApprovalApi = new _StockTransferApprovalApi()
// Report
export const ReportInvApi = new _ReportInvApi()
// PATIENT
export const PatientApi = new _PatientApi()
