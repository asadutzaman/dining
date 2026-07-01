import ReviseRequisitionActionController from 'src/app/modules/inventory/components/RequisitionApproval/Block/ReviseRequisition/ReviseRequisitionAction.controller'
import ApproveActionController from './ApproveAction/ApproveAction.controller'
import DelegateActionController from './DelegateAction/DelegateAction.controller'

export const WorkflowActionDataList = [
  {
    action_name: 'Delegate',
    action_code: 'DELEGATE',
    action_alias_text: 'Delegate',
    action_component: DelegateActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Approve',
    action_code: 'APPROVE',
    action_alias_text: 'Approve',
    action_component: ApproveActionController,
    action_button_class: 'btn-primary',
    is_comment_mandatory: false,
    sort_order: 1,
  },
  {
    action_name: 'Reject',
    action_code: 'REJECT',
    action_alias_text: 'Reject',
    action_component: ApproveActionController,
    action_button_class: 'btn-danger',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Send Back',
    action_code: 'SEND_BACK',
    action_alias_text: 'Send Back',
    action_component: ApproveActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Revise',
    action_code: 'REVISE',
    action_alias_text: 'Revise Qty',
    action_component: ReviseRequisitionActionController,
    action_button_class: 'btn-info',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Disburse',
    action_code: 'DISBURSE',
    action_alias_text: 'Disburse',
    action_component: ApproveActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: false,
    sort_order: 1,
  },
  // FOR GRN
  {
    action_name: 'Initiation',
    action_code: 'INITIATION',
    action_alias_text: 'Initiation',
    action_component: DelegateActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: true,
    sort_order: 1,
  },
]
