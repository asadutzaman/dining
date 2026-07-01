import React from 'react'
import LoadDrawerView from 'src/app/components/LoadComponent/LoadDrawerView'

export const RequisitionAnalyticReportAction = {
  COMMON_ACTION: {
      REQUISITION_VIEW: {
        type: 'item',
        title: 'View Requisition',
        action: 'view',
        link: { to: '' },
        permission: '',
        // component: RequisitionViewController,
        className: 'grid-view-action',
        // icon: <EyeOutlined />,
        modalId: 'view',
      },
    },
}
