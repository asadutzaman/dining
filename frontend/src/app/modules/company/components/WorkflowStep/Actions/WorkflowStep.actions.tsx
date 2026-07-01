import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import WorkflowStepFormController from '../Form/WorkflowStepForm.controller'
// import WorkflowStepViewController from '../View/WorkflowStepView.controller'

export const WorkflowStepAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Approval Step',
      action: 'create',
      link: {to: 'create'},
      permission: 'auth:workflowStep:create',
      component: WorkflowStepFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Approval Step',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:workflowStep:edit',
      component: WorkflowStepFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Approval Step',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:workflowStep:delete',
      component: '',
      className: 'grid-view-action',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: {to: ''},
      permission: 'auth:workflowStep:edit',
      component: EditAction,
      className: '',
      modalId: 'edit',
      icon: 'pencil',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:workflowStep:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:workflowStep:multiSelect',
    action_list: [
      {
        type: 'item',
        title: 'Mark as Active',
        action: 'active',
        link: {to: ''},
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Mark as Inactive',
        action: 'inactive',
        link: {to: ''},
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Delete',
        action: 'delete',
        link: {to: ''},
        permission: 'auth:workflowStep:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
}
