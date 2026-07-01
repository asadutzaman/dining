import React, { FC, Fragment } from 'react';
import { Drawer, Spin, Button } from 'antd';
import useResponsive from '../../hooks/useResponsive';
import CustomScrollbar from '../Scrollbar/CustomScrollbar';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  formRef: any;
  drawerWidth?: any;
  modalTitle: any;
  loading: any;
  isShowForm: any;
  children?: any;
  component?: any;
  handleCallbackFunc: any;
  [key: string]: any;
}

const DrawerForm: FC<IProps> = (props) => {
  const { t } = useLang();
  const { isMobile } = useResponsive();
  const {
    formRef,
    drawerWidth,
    modalTitle,
    loading,
    isShowForm,
    children,
    component: Component,
    handleCallbackFunc,
    ...restProps
  } = props;
  const onSubmit = () => {
    formRef.submit();
  };
  return (
    <Fragment>
      <Drawer
        width={isMobile ? '100%' : drawerWidth ? drawerWidth : '60%'}
        className="form-page-drawer form-page-drawer-example"
        title={
          <b>
            {t(modalTitle)}&nbsp;&nbsp;{loading && <Spin size="small" />}
          </b>
        }
        open={isShowForm}
        onClose={(event) => handleCallbackFunc(null, 'hideForm')}
        footer={[
          <Button
            key="cancel"
            className="me-3"
            onClick={(event) => handleCallbackFunc(null, 'hideForm')}
          >
            {t('Cancel')}
          </Button>,
          <Button
            key="submit"
            className=""
            type="primary"
            loading={loading}
            onClick={onSubmit}
          >
            {t('Submit')}
          </Button>,
        ]}
        footerStyle={{ textAlign: 'right' }}
      >
        <CustomScrollbar className="form-page-drawer-scrollbar">
          <Component
            loading={loading}
            formRef={formRef}
            handleCallbackFunc={handleCallbackFunc}
            {...restProps}
          />
        </CustomScrollbar>
      </Drawer>
    </Fragment>
  );
};
export default React.memo(DrawerForm);
