interface Values { [fieldName: string]: any }

export interface IFormData {
    values: Values,
    isSubmitting: boolean,
    initialValues: Values,
}

export interface IProps {
    formRef: any;
    initialValues: Values,
    rules: any,
    loading: boolean,
    isSubmitting: boolean,
    handleChange: (changedValues: any) => void;
    handleSubmit: (event: any) => void;
    handleSubmitFailed: (values: any) => void;
    [key: string]: any,
}
