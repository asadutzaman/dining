import React, { FC, useEffect, useState } from 'react';
import { Row, Col, Tabs } from 'antd';
import PermissionResourcePanel from './PermissionResource.panel';

const PermissionResourceView: FC<any> = (props) => {
  const { TabPane } = Tabs;
  const { roleId, listData } = props;
  const [permissionListData, setPermissionListData] = useState<any[]>([]);

  useEffect(() => {
    if (listData.length) {
      handleOnChangeTab();
    }
  }, [listData]);

  const handleOnChangeTab = () => {
    setPermissionListData(listData);
  };

  return (
    <div className="listing-page-view page-view-permission-resource">
      <Row gutter={[16, 16]}>
        {permissionListData?.map((item, index) => (
          <Col span={12}>
            <PermissionResourcePanel roleId={roleId} item={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default React.memo(PermissionResourceView);
