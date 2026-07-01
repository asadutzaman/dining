import React from 'react'
import WorkflowFormController from '../Form/WorkflowForm.controller'
import WorkflowViewController from '../View/WorkflowView.controller'
import ViewAction from 'src/app/components/Actions/ViewAction'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'

export const WorkflowAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Workflow',
      action: 'create',
      link: {to: ''},
      permission: 'auth:workflow:create',
      component: WorkflowFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Workflow',
      action: 'edit',
      link: {to: ''},
      permission: 'auth:workflow:edit',
      component: WorkflowFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Workflow',
      action: 'view',
      link: {to: ''},
      permission: 'auth:workflow:view',
      component: WorkflowViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Workflow',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:workflow:delete',
      component: '',
      className: 'grid-view-action',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'View',
      action: 'active',
      link: {to: ''},
      permission: 'auth:workflow:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: {to: ''},
      permission: 'auth:workflow:edit',
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
      permission: 'auth:workflow:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:workflow:multiSelect',
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
        permission: 'auth:workflow:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
}
