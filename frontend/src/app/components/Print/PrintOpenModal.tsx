import { FC, Fragment, useState } from "react";
import { Button, Modal } from "antd";
import { EyeOutlined } from '@ant-design/icons';
import { usePrint } from "src/app/hooks/usePrint";
import { ExportUtils } from "src/app/utils";

interface IProps {
    component: any;
    exportToXLS?: any;
    width?: any;
    btnText?: any;
    btnIcon?: any;
    modalBtnText?: any;
    modalTitle?: any;
    [key: string]: any;
}

/**
 * <PrintOpenModal btnText={t("Print Preview")} modalBtnText={"Print"} modalTitle={t("Print Preview")} component={PreviewContent} />
 */
const PrintOpenModal: FC<IProps> = (props) => {
    const { print } = usePrint();
    const {
        component: Component,
        width,
        exportToXLS,
        btnText,
        btnType,
        btnSize,
        btnIcon,
        modalBtnText,
        modalTitle,
        elementId = 'modal-print-container',
        ...restProps
    } = props;

    const [visible, setVisible] = useState(false);

    const handleVisibleChange = () => {
        setVisible(false);
        let printSection = document.getElementById("printSection");
        if (printSection) {
            printSection.innerHTML = "";
        }
    };

    const showPrintPreview = () => {
        setVisible(true);
    };

    return (
        <Fragment>
            <Modal
                // width={width ?? 720}
                width={width ?? '60%'}
                className="view-page-modal view-page-modal-print"
                title={<b>{modalTitle || "Print Preview"}</b>}
                centered
                maskClosable={false}
                visible={visible}
                onCancel={(event) => handleVisibleChange()}
                footer={[
                    <Button key="close" onClick={(event) => handleVisibleChange()}>
                        {"Close"}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => print(elementId)}
                    >
                        {modalBtnText || "Print"}
                    </Button>,
                    exportToXLS && (
                        <Button
                            className="ms-2"
                            key="submit"
                            type="primary"
                            onClick={() => ExportUtils.export2XLSX("table-to-xls", "SRG-GO-" + new Date().toLocaleString())}
                        >
                            {'Download as XLS'}
                        </Button>
                    )

                ]}
            >
                <div id={elementId} className="print-preview">
                    <Component {...restProps} />
                </div>
            </Modal>
            <Button type={btnType ?? 'primary'} size={btnSize ?? ''} onClick={() => showPrintPreview()}>
                {btnText || "Print Preview"}
            </Button>
        </Fragment>
    );
};

export default PrintOpenModal;
