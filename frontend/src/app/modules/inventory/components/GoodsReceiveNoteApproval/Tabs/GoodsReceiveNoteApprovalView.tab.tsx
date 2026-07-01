import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';
import { ReconcileStatusEnum } from 'src/app/utils/enums/Status.enum';

const GoodsReceiveNoteApprovalViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-1">
        <tr>
          <td width={'20%'}>{t('GRN Number')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.grn_number}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Reference PO Number')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.ref_po_number}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Reference PO Date')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.ref_po_date}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Reference Challan Number')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.ref_challan_no}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Reference Challan Date')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.ref_challan_date}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Branch')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.branch_name}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Logistic')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.logistic_name}</td>
        </tr>
        <tr>
          <td width={'20%'}>{t('Process Status')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.process_status}</td>
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
        <tr>
          <td width={'20%'}>{t('Created By')}</td>
          <td width={'5%'}>:</td>
          <td width={'75%'}>{itemData.created_by_name}</td>
        </tr>
      </table>
    </div>
  );
};
export default React.memo(GoodsReceiveNoteApprovalViewTab);
