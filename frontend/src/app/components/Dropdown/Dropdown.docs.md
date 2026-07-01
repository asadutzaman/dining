---

## Example: Organization Dropdown

<OrganizationSelect
organizationId={formRef.getFieldValue("organization_id")}
placeholder={"Select Organization"}
onSelect={(value, option) => {
formRef.setFieldsValue({ organization_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ organization_id: value });
}}
/>

---

## Example: Organogram Dropdown

<OrganogramSelect
organogramId={formRef.getFieldValue("organogram_id")}
organizationId={formRef.getFieldValue("organization_id")}
placeholder={"Select Organogram"}
onSelect={(value, option) => {
formRef.setFieldsValue({ organogram_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ organogram_id: value });
}}
/>

---

## Example: Color Dropdown

<ColorSelect
colorId={formRef.getFieldValue("color_id")}
placeholder={"Select Color"}
onSelect={(value, option) => {
formRef.setFieldsValue({ color_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ color_id: value });
}}
/>

---

## Example: Color Enum Dropdown

<ColorEnumSelect
colorEnumId={formRef.getFieldValue("color_id")}
placeholder={"Select Color"}
onSelect={(value, option) => {
formRef.setFieldsValue({ color_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ color_id: value });
}}
/>

---

## Example: User Dropdown

<UserSelect
userId={formRef.getFieldValue("user_id")}
placeholder={"Select User"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ user_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ user_id: value });
}}
/>

---

## Example: Unit Dropdown

<UnitSelect
unitId={formRef.getFieldValue("unit_id")}
placeholder={"Select Unit"}
onSelect={(value, option) => {
formRef.setFieldsValue({ unit_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ unit_id: value });
}}
/>

---

## Example: Country Dropdown

<CountrySelect
countryId={formRef.getFieldValue("country_id")}
placeholder={"Select Country"}
onSelect={(value, option) => {
formRef.setFieldsValue({ country_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ country_id: value });
}}
/>

---

## Example: Decipline Dropdown

<DeciplineSelect
deciplineId={formRef.getFieldValue("decipline_id")}
placeholder={"Select Decipline"}
onSelect={(value, option) => {
formRef.setFieldsValue({ decipline_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ decipline_id: value });
}}
/>

---

## Example: Item Category Dropdown

<ItemCategorySelect
itemCategoryId={formRef.getFieldValue("item_category_id")}
placeholder={"Select Item Category"}
onSelect={(value, option) => {
formRef.setFieldsValue({ item_category_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ item_category_id: value });
}}
/>

---

## Example: Item Group Dropdown

<ItemGroupSelect
itemGroupId={formRef.getFieldValue("item_group_id")}
placeholder={"Select Item Group"}
onSelect={(value, option) => {
formRef.setFieldsValue({ item_group_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ item_group_id: value });
}}
/>

---

## Example: Brand Dropdown

<BrandSelect
brandId={formRef.getFieldValue("brand_id")}
placeholder={"Select Brand"}
onSelect={(value, option) => {
formRef.setFieldsValue({ brand_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ brand_id: value });
}}
/>

---

## Example: Shelve Dropdown

<ShelveSelect
shelveId={formRef.getFieldValue("shelve_id")}
placeholder={"Select Shelve"}
onSelect={(value, option) => {
formRef.setFieldsValue({ shelve_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ shelve_id: value });
}}
/>

---

## Example: Customer Dropdown

<CustomerSelect
customerId={formRef.getFieldValue("customer_id")}
placeholder={"Select Customer"}
onSelect={(value, option) => {
formRef.setFieldsValue({ customer_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ customer_id: value });
}}
/>

---

## Example: Cost Overhead Dropdown

<CostOverheadSelect
costOverheadId={formRef.getFieldValue("cost_overhead_id")}
placeholder={"Select Project Overhead"}
onSelect={(value, option) => {
formRef.setFieldsValue({ cost_overhead_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ cost_overhead_id: value });
}}
/>

---

## Example: Designation Dropdown

<DesignationSelect
designationId={formRef.getFieldValue("designation_id")}
placeholder={"Select Designation"}
onSelect={(value, option) => {
formRef.setFieldsValue({ designation_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ designation_id: value });
}}
/>

---

## Example: Warehouse Dropdown

<WarehouseSelect
warehouseId={formRef.getFieldValue("warehouse_id")}
placeholder={"Select Warehouse"}
onSelect={(value, option) => {
formRef.setFieldsValue({ warehouse_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ warehouse_id: value });
}}
/>

---

## Example: Department Dropdown

<DepartmentSelect
departmentId={formRef.getFieldValue("department_id")}
placeholder={"Select Department"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ department_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ department_id: value });
}}
/>

---

## Example: Work Type Dropdown

<ItemSpecificationSelect
itemSpecificationId={formRef.getFieldValue("item_specification_id")}
placeholder={"Select Work Type"}
onSelect={(value, option) => {
formRef.setFieldsValue({ item_specification_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ item_specification_id: value });
}}
/>

---

## Example: Supplier Dropdown

<SupplierSelect
supplierId={formRef.getFieldValue("supplier_id")}
placeholder={"Select Supplier"}
onSelect={(value, option) => {
formRef.setFieldsValue({ supplier_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ supplier_id: value });
}}
/>

---

## Example: BoqTemplate Dropdown

<BoqTemplateSelect
boqTemplateId={formRef.getFieldValue("boq_template_id")}
placeholder={"Select BOQ Template"}
onSelect={(value, option) => {
formRef.setFieldsValue({ boq_template_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ boq_template_id: value });
}}
/>

---

## Example: ShelveLocation Dropdown

<ShelveLocationSelect
shelveLocationId={formRef.getFieldValue("shelve_location_id")}
placeholder={"Select Shelve Location"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ shelve_location_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ shelve_location_id: value });
}}
/>

---

## Example: Approval Workflow Dropdown

<ApprovalWorkflowSelect
approvalWorkflowId={formRef.getFieldValue("approval_workflow_id")}
placeholder={"Select Approval Workflow"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ approval_workflow_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ approval_workflow_id: value });
}}
/>

---

## Example: Job Order Dropdown

<JobOrderSelect
jobOrderId={formRef.getFieldValue("job_order_id")}
placeholder={"Select Job Order"}
onSelect={(value, option) => {
formRef.setFieldsValue({ job_order_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ job_order_id: value });
}}
/>

---

## Example: Requisition Dropdown

<RequisitionSelect
requisitionId={formRef.getFieldValue("requisition_id")}
placeholder={"Select Requisition"}
onSelect={(value, option) => {
formRef.setFieldsValue({ requisition_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ requisition_id: value });
}}
/>

---

## Example: Purchase Order Dropdown

<PurchaseOrderSelect
requisitionId={formRef.getFieldValue("purchase_order_id")}
placeholder={"Select Purchase Order"}
onSelect={(value, option) => {
formRef.setFieldsValue({ purchase_order_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ purchase_order_id: value });
}}
/>

---

## Example: RFQ Wise Supplier Dropdown

<RFQSupplierSelect
supplierId={formRef.getFieldValue("supplier_id")}
rfqId={formRef.getFieldValue("quotation_request_id")}
placeholder={"Select Supplier"}
onSelect={(value, option) => {
formRef.setFieldsValue({ supplier_id: value })
}}
onLoad={(value) => {
formRef.setFieldsValue({ supplier_id: value });
}}
/>

---

## Example: TaxRate Dropdown

<TaxRateSelect
taxRateId={formRef.getFieldValue("tax_rate_id")}
placeholder={"Select Tax Rate"}
onSelect={(value, option) => {
formRef.setFieldsValue({ tax_rate_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ tax_rate_id: value });
}}
/>

---

## Example: Stock Adjustment Dropdown

<StockAdjustmentSelect
stockAdjustmentId={formRef.getFieldValue("stock_adjustment_id")}
placeholder={"Select Stock Adjustment"}
onSelect={(value, option) => {
formRef.setFieldsValue({ stock_adjustment_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ stock_adjustment_id: value });
}}
/>

---

## Example: select branch

// used in branch
<Row gutter={24}>

<Col span={24}>
    <Form.Item label='Parent Branch' name='parent_id'>

<BranchSelect
branchId={formRef.getFieldValue("parent_id")}
placeholder={"Select branch"}
onSelect={(value, option) => {
formRef.setFieldsValue({ parent_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ parent_id: value });
}}
/>
</Form.Item>

</Col>
</Row>

---

## Example: Logistic Dropdown

<LogisticSelect
logisticId={formRef.getFieldValue("logistic_id")}
placeholder={"Select Logistic"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ logistic_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ logistic_id: value });
}}
/>

---

## Example: Item Model Dropdown

<ItemModelSelect
itemModelId={formRef.getFieldValue("item_model_id")}
placeholder={"Select Item Model"}
onSelect={(value, option) => {
formRef.setFieldsValue({ item_model_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ item_model_id: value });
}}
/>

---

## Example: Author Dropdown

<AuthorSelect
authorId={formRef.getFieldValue("author_id")}
placeholder={"Select Author"}
onSelect={(value, option) => {
formRef.setFieldsValue({ author_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ author_id: value });
}}
/>

---

## Example: Publisher Dropdown

<PublisherSelect
publisherId={formRef.getFieldValue("publisher_id")}
placeholder={"Select Publisher"}
onSelect={(value, option) => {
formRef.setFieldsValue({ publisher_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ publisher_id: value });
}}
/>

---

## Example: Unit Dropdown

<UnitSelect
unitId={formRef.getFieldValue("unit_id")}
placeholder={"Select Unit"}
onSelect={(value, option) => {
formRef.setFieldsValue({ unit_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ unit_id: value });
}}
/>

---

## Example: ApproverGroup Dropdown

<ApproverGroupSelect
approverGroupId={formRef.getFieldValue("approver_group_id")}
placeholder={"Select Approver Group"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ approver_group_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ approver_group_id: value });
}}
/>

---

## Example: ApproverGroup Dropdown

<ApproverGroupMemberSelect
approverGroupId={formRef.getFieldValue("approver_group_id")}
approverGroupMemberId={formRef.getFieldValue("approver_group_member_id")}
placeholder={"Select Member"}
allowClear={true}
onSelect={(value, option) => {
formRef.setFieldsValue({ approver_group_member_id: value });
}}
onLoad={(value) => {
formRef.setFieldsValue({ approver_group_member_id: value });
}}
/>

---
