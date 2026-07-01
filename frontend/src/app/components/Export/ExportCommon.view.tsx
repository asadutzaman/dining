import React, { FC } from 'react'
import { Steps } from 'antd';
import ExportCommonExporting from "./ExportCommon.exporting";
import ExportCommonMapping from "./ExportCommon.mapping";
import ExportCommonOption from "./ExportCommon.option";

interface IProps {
    activeStep: any,
    [key: string]: any,
}

const ExportCommonView: FC<IProps> = props => {
    const { Step } = Steps;
    const { activeStep, ...restProps } = props;

    return (
        <div className="export-wizard export-wizard-dealer">
            <div className="export-wizard-steps">
                <Steps current={activeStep} size="small" >
                    <Step key={0} title={'Export Options'} />
                    <Step key={1} title={'Export Fields'} />
                    <Step key={2} title={'Export and Summary'} />
                </Steps>
            </div>

            <div className="export-wizard-content">
                {activeStep == 0 && (
                    <ExportCommonOption
                        {...restProps}
                    />
                )}
                {activeStep == 1 && (
                    <ExportCommonMapping
                        {...restProps}
                    />
                )}
                {activeStep == 2 && (
                    <ExportCommonExporting
                        {...restProps}
                    />
                )}

            </div>
        </div>
    );
}
export default React.memo(ExportCommonView);