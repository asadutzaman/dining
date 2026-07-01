import React, { FC, Fragment } from 'react'
import { Button, Checkbox } from 'antd';

const ExportCommonMapping: FC<any> = props => {
    const { loading, isSubmitting, mapFields, handleOnChangedSelectedFields, handleMapFieldActions } = props;
    return (
        <Fragment>
            <div className="import-step-content import-step-content-mapping">
                <h2>Export Fields</h2>
                <div className="export-selected-fields">
                    <table>
                        <tr>
                            <th colSpan={2}>Fields to Export</th>
                        </tr>
                        {mapFields.filter(item => item.visible == 1)?.map((item, index) => (
                            <tr>
                                <td width={'30px'}>
                                    <Checkbox
                                        checked={item.checked}
                                        onChange={(event) => handleOnChangedSelectedFields('checked', event.target.checked, index)}
                                    >
                                        &nbsp;
                                    </Checkbox>
                                </td>
                                <td>
                                    {item.field_label}
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>

                <br />
                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isSubmitting}
                    loading={loading}
                    onClick={handleMapFieldActions}
                >
                    Start Exporting
                </Button>

            </div>
        </Fragment>
    );
}
export default React.memo(ExportCommonMapping);