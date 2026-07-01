export const LeftSidebarMenu = [
  {
    type: 'group',
    title: 'Root Menu',
    hidden: true,
    children: [
      {
        type: 'item',
        title: 'Dashboard',
        permission: '',
        link: {
          to: '/admin/dashboard',
          exactMatch: true,
          externalUrl: false,
          openInNewTab: false,
        },
        icon: 'abstract-28',
        subParent: false,
        subChildren: [],
      },
    ],
  },

  {
    type: 'group',
    title: 'Settings',
    hidden: false,
    children: [
      // COMPANY
      {
        type: 'item',
        title: 'Company',
        permission: 'auth:organization:menuAccess',
        link: { to: '/' },
        icon: 'people',
        subParent: true,
        subChildren: [
          {
            type: 'item',
            title: 'Users',
            permission: 'auth:user:menuAccess',
            link: {
              to: '/admin/setting/company/users',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Application Settings',
            permission: 'auth:applicationSetting:menuAccess',
            link: {
              to: '/admin/setting/company/application-settings',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Workflow Configuration',
            permission: 'auth:workflow:menuAccess',
            link: {
              to: '/admin/setting/company/workflow-configuration',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Workflow Approver Group',
            permission: 'auth:approverGroup:menuAccess',
            link: {
              to: '/admin/setting/company/approver-group',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Weekends and Holidays',
            permission: 'auth:govtHoliday:menuAccess',
            link: {
              to: '/admin/setting/company/govt-holiday',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
        ],
      },
      // PROFILE
      {
        type: 'item',
        title: 'Profile',
        permission: 'auth:example:menuAccess',
        link: { to: '/' },
        icon: 'setting-4',
        subParent: true,
        subChildren: [
          {
            type: 'item',
            title: 'Change Password',
            permission: 'auth:oauth:changePassword',
            link: {
              to: '/admin/setting/profile/change-password',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
        ],
      },
      // ROLE PERMISSIONS
      {
        type: 'item',
        title: 'Permissions',
        permission: 'auth:resource:menuAccess',
        link: { to: '/' },
        icon: 'lock-2',
        subParent: true,
        subChildren: [
          {
            type: 'item',
            title: 'Resource',
            permission: 'auth:resource:menuAccess',
            link: {
              to: '/admin/setting/permission/resource',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Scope',
            permission: 'auth:scope:menuAccess',
            link: {
              to: '/admin/setting/permission/scope',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Role',
            permission: 'auth:role:menuAccess',
            link: {
              to: '/admin/setting/permission/role',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Permissions',
            permission: 'auth:permission:rolePermission',
            link: {
              to: '/admin/setting/permission/permission-role',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
        ],
      },
    ],
  },

  {
    type: 'group',
    title: 'Patient Management',
    hidden: false,
    children: [
      {
        type: 'item',
        title: 'Patients',
        permission: 'auth:patient:menuAccess',
        link: {
          to: '/admin/patient/list',
          exactMatch: true,
          externalUrl: false,
          openInNewTab: false,
        },
        icon: 'people',
        subParent: false,
        subChildren: [],
      },
    ],
  },

  {
    type: 'group',
    title: 'Back Office Setup',
    hidden: true,
    children: [
      {
        type: 'item',
        title: 'Back Office Setup',
        // permission: "auth:example:menuAccess",
        link: { to: '/' },
        icon: 'setting-2',
        subParent: true,
        subChildren: [
          // {
          //   type: 'item',
          //   title: 'DMP Unit',
          //   permission: 'auth:branch:menuAccess',
          //   link: {
          //     to: '/admin/setup/branch',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          {
            type: 'item',
            title: 'Department',
            permission: 'auth:department:menuAccess',
            link: {
              to: '/admin/setup/department',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Designation',
            permission: 'auth:designation:menuAccess',
            link: {
              to: '/admin/setup/designation',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          {
            type: 'item',
            title: 'Supplier',
            permission: 'auth:supplier:menuAccess',
            link: {
              to: '/admin/setup/supplier',
              exactMatch: true,
              externalUrl: false,
              openInNewTab: false,
            },
          },
          // {
          //   type: 'item',
          //   title: 'Logistic',
          //   permission: 'auth:logistic:menuAccess',
          //   link: {
          //     to: '/admin/setup/logistic',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Item Category',
          //   permission: 'auth:itemCategory:menuAccess',
          //   link: {
          //     to: '/admin/setup/item-category',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Unit',
          //   permission: 'auth:unit:menuAccess',
          //   link: {
          //     to: '/admin/setup/unit',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Brand',
          //   permission: 'auth:brand:menuAccess',
          //   link: {
          //     to: '/admin/setup/brand',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Attribute',
          //   permission: 'auth:attribute:menuAccess',
          //   link: {
          //     to: '/admin/setup/attribute',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Item',
          //   permission: 'auth:item:menuAccess',
          //   link: {
          //     to: '/admin/setup/item',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
          // {
          //   type: 'item',
          //   title: 'Shelve',
          //   permission: 'auth:shelve:menuAccess',
          //   link: {
          //     to: '/admin/setup/shelve',
          //     exactMatch: true,
          //     externalUrl: false,
          //     openInNewTab: false,
          //   },
          // },
        ],
      },
    ],
  },

  // {
  //   type: 'group',
  //   title: 'Inventory',
  //   hidden: false,
  //   children: [
  //     {
  //       type: 'item',
  //       title: 'Requisition',
  //       permission: 'auth:requisition:menuAccess',
  //       link: {
  //         to: '/admin/inventory/requisition',
  //         exactMatch: true,
  //         externalUrl: false,
  //         openInNewTab: false,
  //       },
  //       icon: 'abstract-28',
  //       subParent: false,
  //       subChildren: [],
  //     },
  //     {
  //       type: 'item',
  //       title: 'Goods Receive Note',
  //       permission: 'auth:goodsReceiveNote:menuAccess',
  //       link: {
  //         to: '/admin/inventory/goods-receive-note',
  //         exactMatch: true,
  //         externalUrl: false,
  //         openInNewTab: false,
  //       },
  //       icon: 'abstract-28',
  //       subParent: false,
  //       subChildren: [],
  //     },
  //     {
  //       type: 'item',
  //       title: 'Stock Adjustment',
  //       permission: 'auth:stock-adjustment:menuAccess',
  //       link: {
  //         to: '/admin/inventory/stock-adjustment',
  //         exactMatch: true,
  //         externalUrl: false,
  //         openInNewTab: false,
  //       },
  //       icon: 'abstract-28',
  //       subParent: false,
  //       subChildren: [],
  //     },
  //     {
  //       type: 'item',
  //       title: 'Item Consumption',
  //       permission: 'auth:itemConsumption:menuAccess',
  //       link: {
  //         to: '/admin/inventory/item-consumption',
  //         exactMatch: true,
  //         externalUrl: false,
  //         openInNewTab: false,
  //       },
  //       icon: 'abstract-28',
  //       subParent: false,
  //       subChildren: [],
  //     },
  //     {
  //       type: 'item',
  //       title: 'Stock Transfer',
  //       permission: 'auth:stockTransfer:menuAccess',
  //       link: {
  //         to: '/admin/inventory/stock-transfer',
  //         exactMatch: true,
  //         externalUrl: false,
  //         openInNewTab: false,
  //       },
  //       icon: 'abstract-28',
  //       subParent: false,
  //       subChildren: [],
  //     },

  //     {
  //       type: 'item',
  //       title: 'Approvals',
  //       link: { to: '/' },
  //       icon: 'double-down',
  //       subParent: true,
  //       subChildren: [
  //         {
  //           type: 'item',
  //           title: 'Requisition Approval',
  //           permission: 'auth:requisitionApproval:menuAccess',
  //           link: {
  //             to: '/admin/inventory/requisition-approval',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         {
  //           type: 'item',
  //           title: 'Goods Receive Note Approval',
  //           permission: 'auth:goodsReceiveNoteApproval:menuAccess',
  //           link: {
  //             to: '/admin/inventory/goods-receive-note-approval',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         {
  //           type: 'item',
  //           title: 'Stock Adjustment Approval',
  //           permission: 'auth:stockAdjustmentApproval:menuAccess',
  //           link: {
  //             to: '/admin/inventory/stock-adjustment-approval',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         {
  //           type: 'item',
  //           title: 'Stock Transfer Approval',
  //           permission: 'auth:stockTransferApproval:menuAccess',
  //           link: {
  //             to: '/admin/inventory/stock-transfer-approval',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //       ],
  //     },
  //     // REPORTS
  //     {
  //       type: 'item',
  //       title: 'Reports',
  //       link: { to: '/' },
  //       icon: 'double-down',
  //       subParent: true,
  //       subChildren: [
  //         {
  //           type: 'item',
  //           title: 'Item Stock Analytics',
  //           permission: 'auth:item-stock-analytics-report:menuAccess',
  //           link: {
  //             to: '/admin/inventory/report/item-stock',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         {
  //           type: 'item',
  //           title: 'Requisition Analytics',
  //           permission: 'auth:requisition-analytics-report:menuAccess',
  //           link: {
  //             to: '/admin/inventory/report/requisition-analytics',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         // {
  //         //   type: 'item',
  //         //   title: 'Demand vs Stock',
  //         //   permission: 'auth:item-low-stock-report:menuAccess',
  //         //   link: {
  //         //     to: '/admin/inventory/report/item-low-stock',
  //         //     exactMatch: true,
  //         //     externalUrl: false,
  //         //     openInNewTab: false,
  //         //   },
  //         // },
  //         {
  //           type: 'item',
  //           title: 'Unit Wise Requisition Statistics',
  //           permission:
  //             'auth:unit-wise-requisition-statistics-report:menuAccess',
  //           link: {
  //             to: '/admin/inventory/report/requisition-statistics',
  //             exactMatch: true,
  //             externalUrl: false,
  //             openInNewTab: false,
  //           },
  //         },
  //         {
  //           type: 'item',
  //           title: 'Disbursement Analytics',
  //           permission: '',
  //           link: { to: '/' },
  //           icon: 'people',
  //           subParent: true,
  //           subChildren: [
  //             {
  //               type: 'item',
  //               title: 'Requester Wise',
  //               permission:
  //                 'auth:requester-wise-disbursement-report:menuAccess',
  //               link: {
  //                 to: '/admin/inventory/report/requester-wise-disbursement',
  //                 exactMatch: true,
  //                 externalUrl: false,
  //                 openInNewTab: false,
  //               },
  //             },
  //             {
  //               type: 'item',
  //               title: 'DMP Unit Wise',
  //               permission: 'auth:branch-wise-disbursement-report:menuAccess',
  //               link: {
  //                 to: '/admin/inventory/report/branch-wise-disbursement',
  //                 exactMatch: true,
  //                 externalUrl: false,
  //                 openInNewTab: false,
  //               },
  //             },
  //             {
  //               type: 'item',
  //               title: 'Item Wise',
  //               permission: 'auth:item-wise-disbursement-report:menuAccess',
  //               link: {
  //                 to: '/admin/inventory/report/item-wise-disbursement',
  //                 exactMatch: true,
  //                 externalUrl: false,
  //                 openInNewTab: false,
  //               },
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
];
