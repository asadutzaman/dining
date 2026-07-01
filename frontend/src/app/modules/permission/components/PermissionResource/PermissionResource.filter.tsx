import React, { FC } from 'react';
import { Button, Select, Form } from 'antd';
import { Col, Row } from 'react-bootstrap';
import { useLang } from 'src/app/hooks/useLang';

const PermissionResourceFilter: FC<any> = (props) => {
  const { loading, roleId, roleListData, expandAll, handleExpandAll } = props;
  const { Option } = Select;
  const { t } = useLang();

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <div
            className="card card-header p-0 pb-3"
            style={{ minHeight: '0px' }}
          >
            <h3 className="card-title align-items-start flex-column">
              <span className="card-label fw-bold fs-3 mb-1">
                {t('Role Based Permissions')}
              </span>
            </h3>
          </div>
        </Col>
        <Col md={6} xs={12}></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={6} xs={12}>
          <Form.Item name="roleId">
            <Select
              showSearch
              placeholder="Select Role"
              style={{ minWidth: 180 }}
              defaultValue={roleId}
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {roleListData &&
                roleListData.map((item: any, index: any) => (
                  <Option key={index} value={item.id}>
                    {t(item.name)}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col md={6} xs={12}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('Load Permission')}
          </Button>
        </Col>
      </Row>

      {/* <div className="listing-page-filter">
                <div className="filter-top">
                    <div className="page-heading-title">
                        <h1>{'Role Based Permissions'}</h1>
                    </div>
                </div>

                <div className="filter-bottom">
                    <div className="filter-bottom-left">
                        <div className="filter-box-left select-box status-box">
                            <span>Roles:</span>
                            <Form.Item
                                name="roleId"
                            >
                                <Select
                                    showSearch
                                    placeholder="Select Role"
                                    style={{ minWidth: 180 }}
                                    defaultValue={roleId}
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {roleListData && roleListData.map((item: any, index: any) => (
                                        <Option key={index} value={item.id}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <div className="filter-box-left button-box reset-button-box">
                            <Button type="primary" htmlType="submit" loading={loading}>Load Permission</Button>
                        </div>
                    </div>

                    <div className="filter-bottom-right">
                        <div className="filter-box-right button-box">

                        </div>
                    </div>
                </div>
            </div> */}
    </div>
  );
};
export default React.memo(PermissionResourceFilter);
