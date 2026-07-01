import React from 'react'
import DeleteMoreAction from 'src/app/components/Actions/DeleteMoreAction'
import EditMoreAction from 'src/app/components/Actions/EditMoreAction'

export const AttributeAction = {
  LIST_ITEM_ACTION: [
    {
      type: 'item',
      title: 'Edit',
      action: 'inactive',
      link: {to: ''},
      permission: 'auth:itemAttribute:edit',
      component: EditMoreAction,
      className: 'grid-edit-action',
      icon: 'pencil',
    },
    {
      type: 'item',
      title: 'Delete',
      action: 'delete',
      link: {to: ''},
      permission: 'auth:itemAttribute:delete',
      component: DeleteMoreAction,
      className: 'grid-delete-action',
      icon: 'trash',
    },
  ],
}
