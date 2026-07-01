import React, { FC } from 'react';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import EditAction from 'src/app/components/Actions/EditAction';
import DeleteAction from 'src/app/components/Actions/DeleteAction';
import { ScopeAction } from '../Actions/Scope.actions';
import { useLang } from 'src/app/hooks/useLang';

const ScopeView: FC<any> = (props) => {
  const { itemData, handleCallbackFunc } = props;
  const { t } = useLang();

  return (
    <div className="card card-body position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={ScopeAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={ScopeAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
          <tr>
            <td width={'20%'}>{t('Resource')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.resource_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Scope Key')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.scope}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Display Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.display_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('HTTP Method')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.http_method}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Action Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.action_name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Endpoint URI')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.uri}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Status')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{StatusEnum[itemData.status]}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Created Time')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {DateTimeUtils.formatDateTimeA(itemData.created_at)}
            </td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Updated Time')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>
              {DateTimeUtils.formatDateTimeA(itemData.updated_at)}
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};
export default React.memo(ScopeView);
