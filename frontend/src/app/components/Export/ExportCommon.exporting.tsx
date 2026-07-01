import React, { FC } from 'react'
import { Row, Col, Button, Alert, Tag, Progress, Card, Spin } from 'antd';
import { CONSTANT_CONFIG } from "../../constants";

const ExportCommonExporting: FC<any> = props => {
    const { loading, fileName, exportType, stopExport, exportCompleted, progressPercent, totalRecords, currentExportRecord, remainingRecords, exportedCount, skippedCount, failedCount, logData, handleStopExport } = props;
    return (
        <div className="export-step-content export-step-content-exporting">
            <h2>Export and Summary</h2>

            {loading && <Spin size="small" />}

            {!loading && (
                <>
                    <div className={'section-export section-export-exporting'}>
                        <p>Total Records: {totalRecords}</p>

                        {exportCompleted == true && (
                            <div className={'export-completed'}>
                                <Alert
                                    message="Export successfully completed. Click the button below to download."
                                    type="success"
                                />

                                {exportType == 'csv' && (
                                    <Button type="primary" style={{ marginTop: 15 }}>
                                        <a href={`${CONSTANT_CONFIG.BASE_URL}file/download-file?path=export/csv/${fileName}`} target={'_blank'}>Download Export (CSV)</a>
                                    </Button>
                                )}

                                {exportType == 'xlsx' && (
                                    <Button type="primary" style={{ marginTop: 15 }}>
                                        <a href={`${CONSTANT_CONFIG.BASE_URL}file/download-file?path=export/excel/${fileName}`} target={'_blank'}>Download Export (Excel)</a>
                                    </Button>
                                )}

                                {exportType == 'pdf' && (
                                    <div>
                                        <Button type="primary" style={{ marginTop: 15 }}>
                                            <a href={`${CONSTANT_CONFIG.BASE_URL}file/download-file?path=export/pdf/${fileName}`} target={'_blank'}>Download Export (PDF)</a>
                                        </Button>

                                        <Button type="primary" style={{ marginTop: 15, marginLeft: 15 }}>
                                            <a href={`${CONSTANT_CONFIG.BASE_URL}/pdf/view-export-pdf/${fileName}`} target={'_blank'}>Print Export (PDF)</a>
                                        </Button>
                                    </div>
                                )}

                            </div>
                        )}

                        {exportCompleted == false && (
                            <div className={'progress-bar'}>
                                <Row>
                                    <Col span={24}>
                                        <h3>Export in Progress</h3>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={24}>
                                        <Progress
                                            percent={progressPercent}
                                            status="active" />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={12}>
                                        <Tag color="green">Current Processing Record: {currentExportRecord}</Tag>
                                    </Col>
                                    <Col span={12}>
                                        <Tag className={'float-right'} color="red">Remaining Records: {remainingRecords}</Tag>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={24}>
                                        <Button
                                            type="primary"
                                            className={'pause-btn'}
                                            onClick={handleStopExport}
                                        >
                                            {stopExport === true ? (<span>Start Export</span>) : (<span>Stop Export</span>)}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )}

                    </div>

                    <div className={'section-export section-export-exporting-result'}>
                        <h3>Results</h3>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Card bordered={false}>
                                    <div className="card-header">
                                        <h3>Exported</h3>
                                    </div>
                                    <div className="card-content">
                                        <span className="card-count">{exportedCount}</span>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card bordered={false}>
                                    <div className="card-header">
                                        <h3>Skipped</h3>
                                    </div>
                                    <div className="card-content">
                                        <span className="card-count">{skippedCount}</span>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card bordered={false}>
                                    <div className="card-header">
                                        <h3>Failed</h3>
                                    </div>
                                    <div className="card-content">
                                        <span className="card-count">{failedCount}</span>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <div className={'section-export section-export-log'}>
                        <h3>Export Log</h3>
                        <div className={'export-log-content'}>
                            <table width={"100%"} className="table">
                                <tr>
                                    <th>Line</th>
                                    <th>Status</th>
                                    <th>Log Data</th>
                                    <th>Reason for failure</th>
                                </tr>

                                {logData?.map((logItem, index) => (
                                    <tr>
                                        <td width={100}>{logItem.line}</td>
                                        <td width={150}>{logItem.status}</td>
                                        <td>&nbsp;</td>
                                        <td>{logItem.reason}</td>
                                    </tr>
                                ))}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
export default React.memo(ExportCommonExporting);