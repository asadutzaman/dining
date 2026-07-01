import * as React from 'react';

export const phonePattern = /^[0-9+]{8,14}$/;
export const emailPattern = /^[a-zA-Z-_.]+@[a-zA-Z-]+\.[a-zA-Z]{2,6}$/;

export default class FormValidateFunction {
    public example = (rule: any, value: any, callback: any, message?: any) => {
        if (!value) {
            callback(message);
        }
        callback();
    }

    public validateUpload = (rule: any, value: any, callback: any, fileList?: any, message?: any) => {
        if (!fileList.length) {
            callback(message || 'This field is required.');
        }

        callback();
    }

    public validateMinLength = () => {

    }
}

