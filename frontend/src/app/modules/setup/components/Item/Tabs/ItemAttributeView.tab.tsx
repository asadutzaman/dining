import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const ItemAttributeViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle gs-1 gy-1">
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Attribute')}</th>
            <th>{t('Attribute Value')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.item_attributes !== undefined &&
            itemData.item_attributes.map((item: any, index: any) => (
              <tr key={`local-${index}`}>
                <td>{++index}</td>
                <td>{item.attribute_name}</td>
                <td>{item.attribute_value_name}</td>
              </tr>
            ))}

          {itemData.item_attributes &&
            itemData.item_attributes.length === 0 && (
              <tr>
                <td colSpan={3} align="center">
                  {t('Item Attribute Not Found')}
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(ItemAttributeViewTab);
