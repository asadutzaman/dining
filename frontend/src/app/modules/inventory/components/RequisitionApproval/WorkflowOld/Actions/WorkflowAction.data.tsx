import ApproveActionController from './ApproveAction/ApproveAction.controller'

export const WorkflowActionDataList = [
  {
    action_name: 'Delegate',
    action_alias_text: 'Delegate',
    action_component: ApproveActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Approve',
    action_alias_text: 'Approve',
    action_component: ApproveActionController,
    action_button_class: 'btn-primary',
    is_comment_mandatory: false,
    sort_order: 1,
  },
  {
    action_name: 'Reject',
    action_alias_text: 'Reject',
    action_component: ApproveActionController,
    action_button_class: 'btn-danger',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Send Back',
    action_alias_text: 'Send Back',
    action_component: ApproveActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Revise',
    action_alias_text: 'Revise Qty',
    action_component: ApproveActionController,
    action_button_class: 'btn-info',
    is_comment_mandatory: true,
    sort_order: 1,
  },
  {
    action_name: 'Disburse',
    action_alias_text: 'Disburse',
    action_component: ApproveActionController,
    action_button_class: 'btn-warning',
    is_comment_mandatory: false,
    sort_order: 1,
  },
]
