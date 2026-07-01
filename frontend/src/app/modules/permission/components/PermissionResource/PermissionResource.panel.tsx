import React, { FC, useState } from 'react';
import { Checkbox, Collapse } from 'antd';
import PermissionResourceCheckbox from './PermissionResource.checkbox';

const PermissionResourcePanel: FC<any> = (props) => {
  const { roleId, item } = props;
  const { Panel } = Collapse;
  // const [isCheckAll, setIsCheckAll] = useState(false);

  // const handleCheckAll = (e: any, resourceItem: any): void => {
  //     const status = e.target.checked;
  //     setIsCheckAll(status);
  // };

  return (
    <Collapse defaultActiveKey={[1]} expandIconPosition="end">
      {/* <Checkbox checked={isCheckAll} onChange={(e) => handleCheckAll(e, item.id)}></Checkbox> */}
      <Panel key="1" header={item.display_name}>
        <div className="permission-list">
          <ul>
            {item.scopes?.map((scopeItem: any, scopeIndex: any) => (
              <li>
                <PermissionResourceCheckbox
                  roleId={roleId}
                  scopeItem={scopeItem}
                  // checkAll={isCheckAll}
                />
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </Collapse>
  );
};

export default React.memo(PermissionResourcePanel);
