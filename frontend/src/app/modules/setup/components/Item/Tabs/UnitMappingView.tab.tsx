import React, { FC } from 'react';
import { useLang } from 'src/app/hooks/useLang';
import { DateTimeUtils } from 'src/app/utils';
import { StatusEnum } from 'src/app/utils/enums';

const UnitMappingViewTab: FC<any> = (props) => {
  const { itemData } = props;
  const { t } = useLang();

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle gs-1 gy-1">
        <thead>
          <tr>
            <th>{t('SL.')}</th>
            <th>{t('Unit Name')}</th>
            <th>{t('Conversion to Base Unit')}</th>
          </tr>
        </thead>

        <tbody>
          {itemData.item_unit_mappings !== undefined &&
            itemData.item_unit_mappings.map((item: any, index: any) => (
              <tr key={`local-${index}`}>
                <td>{++index}</td>
                <td>{t(item.unit_name)}</td>
                <td>{t(item.conversion_to_base)}</td>
              </tr>
            ))}

          {itemData.item_unit_mappings &&
            itemData.item_unit_mappings.length === 0 && (
              <tr>
                <td colSpan={3} align="center">
                  {t('Unit Mapping Not Found')}
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(UnitMappingViewTab);
