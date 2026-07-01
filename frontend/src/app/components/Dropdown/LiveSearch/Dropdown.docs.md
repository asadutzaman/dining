------------------------------------------------
Example: JobWiseItemSelect Dropdown
------------------------------------------------
<JobWiseItemSelect
    jobOrderId={formRef.getFieldValue('job_order_id')}
    itemCode={formRef.getFieldValue("item_id")}
    placeholder={"Search by Item code (type min 6 digit)"}
    onLoad={(value) => {
        formRef.setFieldsValue({ item_id: value });
    }}
    onSelect={handleJobWiseItemSelect}
    onChange={(value, option) => {
        formRef.setFieldsValue({ item_id: value });
    }}
/>

------------------------------------------------
Example: ItemSelect Dropdown
------------------------------------------------
<ItemSelect
    productNameCode={formRef.getFieldValue("product_id")}
    placeholder={"Search by Item Name/Code (type min 6 digit)"}
    onLoad={(value) => {
        formRef.setFieldsValue({ product_id: value });
    }}
    onSelect={handleItemSelect}
    onChange={(value, option) => {
        formRef.setFieldsValue({ product_id: value });
    }}
/>

------------------------------------------------
Example: ItemSelect Dropdown
------------------------------------------------
<JobOrderSelect
    exceptJobOrderId={itemData.job_order_id}
    itemId={itemData.item_id}
    jobNumber={formRef.getFieldValue("job_order_id")}
    placeholder={"Search Job Number"}
    onLoad={(value) => {
        formRef.setFieldsValue({ job_order_id: value });
    }}
    onSelect={(value, option) => {
        formRef.setFieldsValue({ job_order_id: value });
        formRef.setFieldsValue({ job_number: option.label });
        formRef.setFieldsValue({ available_stock_qty: option.available_stock });
    }}
    onChange={(value, option) => {
        formRef.setFieldsValue({ job_order_id: value });
    }}
/>

------------------------------------------------
Example: ItemSelect Dropdown
------------------------------------------------
<ItemSelect
    itemNameCode={formRef.getFieldValue("item_id")}
    placeholder={"Search by Item Name/Code (type min 6 digit)"}
    onLoad={(value) => {
        formRef.setFieldsValue({ item_id: value });
    }}
    onSelect={handleItemSelect}
    onChange={(value, option) => {
        formRef.setFieldsValue({ item_id: value });
    }}
/>
