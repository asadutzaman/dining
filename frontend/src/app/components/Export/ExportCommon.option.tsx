import React, { FC, Fragment } from 'react'
import { Button, Radio, Row, Col } from 'antd';

const ExportCommonOption: FC<any> = props => {
    const { loading, isSubmitting, exportMode, exportType, orientationPage, recordPerPage, offset, limit, handleExportOptionActions, handleOnChanged } = props;
    const {
        exportModeSectionList = ['EXPORT_CURRENT_PAGE', 'EXPORT_SELECTED_RECORDS', 'EXPORT_ALL_PAGES'],
        exportFormatSectionList = ['xlsx', 'pdf', 'doc', 'print'],
        isShowExportOption = true
    } = props;

    return (
        <Fragment>
            <div className="export-step-content export-step-content-setting">
                <h2>Export Options</h2>
                <br />
                <div className={'section-export section-export-mode'}>
                    <h3>Export</h3>
                    <div>
                        <Radio.Group
                            defaultValue={exportMode}
                            onChange={(event) => handleOnChanged('exportMode', event.target.value)}
                        >
                            <ul>
                                {exportModeSectionList.includes('EXPORT_ALL_PAGES') && (
                                    <li><Radio value={'EXPORT_ALL_PAGES'}>All Records</Radio></li>
                                )}
                                {exportModeSectionList.includes('EXPORT_SELECTED_RECORDS') && (
                                    <li><Radio value={'EXPORT_SELECTED_RECORDS'}>Selected Records</Radio></li>
                                )}
                                {exportModeSectionList.includes('EXPORT_CURRENT_PAGE') && (
                                    <li><Radio value={'EXPORT_CURRENT_PAGE'}>Current Page</Radio></li>
                                )}
                            </ul>
                        </Radio.Group>
                    </div>
                </div>

                <div className={'section-export section-export-type'}>
                    <h3>Export Format</h3>
                    <div>
                        <Radio.Group
                            defaultValue={exportType}
                            onChange={(event) => handleOnChanged('exportType', event.target.value)}
                        >
                            <ul>
                                {exportFormatSectionList.includes('xlsx') && (
                                    <li><Radio value={'xlsx'}>Excel</Radio></li>
                                )}
                                {exportFormatSectionList.includes('pdf') && (
                                    <li><Radio value={'pdf'}>PDF</Radio></li>
                                )}
                                {exportFormatSectionList.includes('doc') && (
                                    <li><Radio value={'doc'}>DOC</Radio></li>
                                )}
                                {exportFormatSectionList.includes('print') && (
                                    <li><Radio value={'print'}>Print</Radio></li>
                                )}
                            </ul>
                        </Radio.Group>
                    </div>
                </div>

                {exportType == 'pdf' && (
                    <div className={'section-export section-export-pdf-option'}>
                        <h3>PDF Options</h3>

                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <label>Orientation</label>
                            </Col>
                            <Col span={12}>
                                <Radio.Group
                                    defaultValue={orientationPage}
                                    onChange={(event) => handleOnChanged('orientationPage', event.target.value)}
                                >
                                    <Radio value={'P'}>Portrait</Radio>
                                    <Radio value={'L'}>Landscape</Radio>
                                </Radio.Group>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
                            <Col span={6}>
                                <label>Records per page</label>
                            </Col>
                            <Col span={12}>
                                <input
                                    defaultValue={recordPerPage}
                                    onChange={(event) => handleOnChanged('recordPerPage', event.target.value)}
                                />
                            </Col>
                        </Row>
                    </div>
                )}

                {isShowExportOption && (
                    <div className={'section-export section-export-option'}>
                        <h3>Export Number</h3>

                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <label>Offset Records</label>
                            </Col>
                            <Col span={12}>
                                <input
                                    placeholder={'0'}
                                    defaultValue={offset}
                                    onChange={(event) => handleOnChanged('offset', event.target.value)}
                                />
                                <p>The number of records to skip from starting.</p>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <label>Limit Records</label>
                            </Col>
                            <Col span={18}>
                                <input
                                    placeholder={'Unlimited'}
                                    defaultValue={limit}
                                    onChange={(event) => handleOnChanged('limit', event.target.value)}
                                />
                                <p>The number of records to export.</p>
                            </Col>
                        </Row>
                    </div>
                )}

                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isSubmitting}
                    loading={loading}
                    onClick={handleExportOptionActions}
                >
                    Proceed to export
                </Button>

            </div>
        </Fragment>
    );
}
export default React.memo(ExportCommonOption);