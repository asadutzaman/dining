import React, { FC } from "react";
import { Form, Row, Col, Select } from "antd";
import { rules } from '../../../../components/Validation/Form.validate';

const AddOrEditForm: FC<any> = (props) => {
    const { Option } = Select;
    const { formRef, initialValues, handleChange, handleSubmit, handleSubmitFailed } = props;
    const { loadingOrganizationList, organizationList, loadingOrganogramList, activeOrganogramList } = props;

    return (
        <>
            <div className="organization-select-content">
                <Form
                    form={formRef}
                    name="loginForm"
                    scrollToFirstError={true}
                    initialValues={initialValues}
                    onValuesChange={handleChange}
                    onFinish={handleSubmit}
                    onFinishFailed={handleSubmitFailed}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Form.Item
                                label={"Organization"}
                                name="organization_id"
                                rules={rules.required}
                            >
                                <Select
                                    placeholder={"-- Select --"}
                                    showSearch
                                    allowClear
                                    popupMatchSelectWidth={200}
                                    loading={loadingOrganizationList}
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
                                >
                                    {organizationList.map((item: any, index: any) => (
                                        <Option key={`organization-id-${index}`} value={item?.id.toString()}>
                                            {item?.name_en}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                label={"Organogram"}
                                name="organogram_id"
                                rules={rules.required}
                            >
                                <Select
                                    placeholder={"-- Select --"}
                                    showSearch
                                    allowClear
                                    popupMatchSelectWidth={200}
                                    loading={loadingOrganogramList}
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) => option.children.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0}
                                >
                                    {activeOrganogramList.map((item: any, index: any) => (
                                        <Option key={`organogram-id-${index}`} value={item?.id.toString()}>
                                            {item?.name_en}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    );
};

export default React.memo(AddOrEditForm);
