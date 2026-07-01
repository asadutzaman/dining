import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const AttributeValueViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle gs-1 gy-1">
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Value')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.attributeValueListData !== undefined &&
            itemData.attributeValueListData.map(
              (localItem: any, localIndex: any) => (
                <tr key={`local-${localIndex}`}>
                  <td>{++localIndex}</td>
                  <td>{localItem.value}</td>
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(AttributeValueViewTab);
