import React from 'react';
import GrnViewController from '../GrnView/GrnView.controller';
import DisbursementViewController from '../DisbursementView/DisbursementView.controller';

export const ItemStockReportAction = {
  COMMON_ACTION: {
    GRN_VIEW: {
      type: 'item',
      title: 'View GRN',
      action: 'view',
      link: { to: '' },
      permission: '',
      component: GrnViewController,
      className: 'grid-view-action',
      // icon: <EyeOutlined />,
      modalId: 'view',
    },
    DISBURSEMENT_VIEW: {
      type: 'item',
      title: 'View Disbursement',
      action: 'view',
      link: { to: '' },
      permission: '',
      component: DisbursementViewController,
      className: 'grid-view-action',
      // icon: <EyeOutlined />,
      modalId: 'view',
    },
  },
};
