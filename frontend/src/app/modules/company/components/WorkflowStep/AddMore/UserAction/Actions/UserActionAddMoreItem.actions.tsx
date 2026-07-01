import React from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import EditMoreAction from 'src/app/components/Actions/EditMoreAction';
import DeleteMoreAction from 'src/app/components/Actions/DeleteMoreAction';

export const UserActionAddMoreItemActions = {
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: { to: '' },
      permission: '',
      component: EditMoreAction,
      className: '',
      modalId: 'edit',
      icon: 'pencil',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: { to: '' },
      permission: '',
      component: DeleteMoreAction,
      className: '',
      modalId: 'delete',
      icon: 'trash',
    },
  ],
};
