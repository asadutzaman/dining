import React, { FC, useState } from 'react';
import { Checkbox, Spin } from 'antd';
import { Message } from '../../../../utils';
import { PermissionApi } from '../../../../api';
import { useLang } from 'src/app/hooks/useLang';

const PermissionResourceCheckbox: FC<any> = (props) => {
  const { roleId, scopeItem, checkAll } = props;
  const [loading, setLoading] = useState(false);
  const [isCheck, setIsCheck] = useState(scopeItem.checked);
  const { t } = useLang();

  const handleChangePermission = (e: any, scopeItem: any): void => {
    setLoading(true);

    const status = e.target.checked;
    setIsCheck(status);

    const payload = {
      scope_id: scopeItem,
      role_id: roleId,
      status: status,
    };

    PermissionApi.savePermission(payload)
      .then((res) => {
        setLoading(false);
      })
      .catch((err) => {
        Message.error(t('A network error occurred. Please try again later.'));
        setLoading(false);
      });
  };

  return (
    <Checkbox
      value={scopeItem.value}
      // checked={checkAll ? true : isCheck}
      checked={isCheck}
      onChange={(e) => handleChangePermission(e, scopeItem.id)}
    >
      {loading && (
        <>
          <Spin size="small" spinning={loading} />
          &nbsp;
        </>
      )}
      {t(scopeItem.display_name)}
    </Checkbox>
  );
};

export default React.memo(PermissionResourceCheckbox);
