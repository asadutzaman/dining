import React, { FC } from 'react';
import { DateTimeUtils } from '../../../../../utils';
import EditAction from '../../../../../components/Actions/EditAction';
import DeleteAction from '../../../../../components/Actions/DeleteAction';
import { ApproverGroupAction } from '../Actions/ApproverGroup.actions';
import { StatusEnum } from '../../../../../utils/enums';
import { useLang } from 'src/app/hooks/useLang';

const ApproverGroupView: FC<any> = (props) => {
  const { itemData, handleCallbackFunc } = props;
  const { t } = useLang();

  return (
    <div className="card card-body position-relative">
      <div className="row mb-7">
        <div className="col-lg-12">
          <EditAction
            entityId={itemData.id}
            actionItem={ApproverGroupAction.COMMON_ACTION.EDIT}
            handleCallbackFunc={handleCallbackFunc}
          />
          <DeleteAction
            entityId={itemData.id}
            actionItem={ApproverGroupAction.COMMON_ACTION.DELETE}
            handleCallbackFunc={handleCallbackFunc}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
          <tr>
            <td width={'20%'}>{t('Approver Group Name')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.name}</td>
          </tr>
          <tr>
            <td width={'20%'}>{t('Description')}</td>
            <td width={'5%'}>:</td>
            <td width={'75%'}>{itemData.description}</td>
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
      <h3>{t('Member List')}</h3>
      <div className="table table-responsive">
        <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>{t('SL.')}</th>
              <th style={{ width: '50%' }}> {t('Name')}</th>
              <th style={{ width: '40%' }}>{t('Approver Type')}</th>
            </tr>
          </thead>

          <tbody>
            {itemData?.approverGroupMemberListData &&
              itemData?.approverGroupMemberListData.map(
                (item: any, index: any) => (
                  <tr key={`user-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.user_name}</td>
                    <td>{item.approver_type}</td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default React.memo(ApproverGroupView);
