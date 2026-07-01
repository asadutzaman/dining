import DeleteAction from 'src/app/components/Actions/DeleteAction';
import EditAction from 'src/app/components/Actions/EditAction';
import ViewAction from 'src/app/components/Actions/ViewAction';
import DepartmentFormController from '../Form/DepartmentForm.controller';
import DepartmentViewController from '../View/DepartmentView.controller';

export const DepartmentAction = {
  COMMON_ACTION: {
    CREATE: {
      type: 'item',
      title: 'New Department',
      action: 'create',
      link: { to: '' },
      permission: 'auth:department:create',
      component: DepartmentFormController,
      className: 'grid-view-action',
    },
    EDIT: {
      type: 'item',
      title: 'Edit Department',
      action: 'edit',
      link: { to: '' },
      permission: 'auth:department:edit',
      component: DepartmentFormController,
      className: 'grid-view-action',
      modalId: 'edit',
    },
    VIEW: {
      type: 'item',
      title: 'View Department',
      action: 'view',
      link: { to: '' },
      permission: 'auth:department:view',
      component: DepartmentViewController,
      className: 'grid-view-action',
      modalId: 'view',
    },
    DELETE: {
      type: 'item',
      title: 'Delete Department',
      action: 'delete',
      link: { to: '' },
      permission: 'auth:department:delete',
      component: '',
      className: 'grid-view-action',
    },
  },
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'View',
      action: 'active',
      link: { to: '' },
      permission: 'auth:department:view',
      component: ViewAction,
      className: '',
      modalId: 'view',
      icon: 'information-4',
    },
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: { to: '' },
      permission: 'auth:department:edit',
      component: EditAction,
      className: '',
      modalId: 'edit',
      icon: 'pencil',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: { to: '' },
      permission: 'auth:department:delete',
      component: DeleteAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
  BULK_ACTION: {
    permission: 'auth:department:multiSelect',
    action_list: [
      {
        type: 'item',
        title: 'Mark as Active',
        action: 'active',
        link: { to: '' },
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Mark as Inactive',
        action: 'inactive',
        link: { to: '' },
        component: '',
        className: 'grid-view-action',
      },
      {
        type: 'item',
        title: 'Delete',
        action: 'delete',
        link: { to: '' },
        permission: 'auth:department:delete',
        component: '',
        className: 'grid-view-action',
      },
    ],
  },
};
