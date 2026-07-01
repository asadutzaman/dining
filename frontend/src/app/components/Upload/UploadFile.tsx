import React, { useState, useEffect } from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FileApi } from "../../api";
import { CONSTANT_CONFIG } from "../../constants";
import { Message } from "../../utils";

interface IProps {
    fileId?: any,
    fileList: any,
    setFileList: any,
    accept?: any,
    axUploadSize?: any,
    [key: string]: any,
}

const UploadFile: React.FC<IProps> = props => {

    const { fileId, fileList, setFileList, accept = ".pdf,.doc,.docx,.xlsx,.xls,.zip", maxUploadSize = 2000000 } = props;
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);

    useEffect(() => {
        if (fileId) {
            FileApi.getFileById(fileId)
                .then(res => {
                    let fileInfo = {
                        uid: `${res.data.file_id}`,
                        file_id: res.data.file_id,
                        name: res.data.original_filename,
                        url: CONSTANT_CONFIG.MEDIA_SOURCE + res.data.file_id,
                    }
                    setFileList([fileInfo])
                    setUploadLoading(false)
                }).catch(err => {
                    setUploadLoading(false)
                });
        }
    }, [fileId]);

    const handleChangeFile = (info: any) => {
        if (info.file.status === 'uploading') {
            setUploadLoading(true);
            return;
        }
        if (info.file.status === 'error') {
            setUploadLoading(false);
            return;
        }
        if (info.file.status === 'done') {
            setUploadLoading(false);
            return;
        }
    };
    const handleBeforeUploadFile = (file: File, FileList: File[]) => {
        const MAX_UPLOAD_SIZE = maxUploadSize;
        const uploadSizeErrorMessage = maxUploadSize / 1000000;
        const isFileTypeOk = file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const isFileSizeOk = file.size < MAX_UPLOAD_SIZE;

        if (!isFileTypeOk) {
            Message.error('File Type Invalid');
            return false;
        }
        else if (!isFileSizeOk) {
            Message.error(`File must smaller than ${uploadSizeErrorMessage}MB!`);
            return false;
        }
        else {
            return true;
        }
    }
    const handleRemoveUploadFile = (file: any) => {
        setFileList((prevFileList: any) => {
            return prevFileList.filter((item: any) => item !== file)
        })
    };

    const handleFileUpload = (name: string, file: any) => {
        setUploadLoading(true);
        FileApi.upload(file)
            .then(res => {
                let fileInfo = {
                    uid: `${res.data.uid}`,
                    file_id: res.data.file_id,
                    name: res.data.original_filename,
                    url: CONSTANT_CONFIG.MEDIA_SOURCE + res.data.file_id,
                }
                setFileList([fileInfo]);
                setUploadLoading(false);
            })
            .catch(err => {
                setUploadLoading(false);
            });
    }

    return (
        <>
            <Upload
                name="file_uploader"
                accept={accept}
                className="file-uploader"
                multiple={false}
                fileList={fileList}
                onChange={handleChangeFile}
                beforeUpload={handleBeforeUploadFile}
                onRemove={handleRemoveUploadFile}
                customRequest={({ file }) => handleFileUpload('file', file)}
            >
                <Button className="btn-upload" loading={uploadLoading}>
                    {'Click to Upload'}
                </Button>
            </Upload>
        </>
    );
}

export default React.memo(UploadFile);
