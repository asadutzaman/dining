import React from 'react';
import { useLang } from 'src/app/hooks/useLang';

type Props = {
  currentPage: number;
  pageSize: number;
  total: number;
};

const PaginationTotalItem: React.FC<Props> = (props: Props) => {
  const { t } = useLang();
  const { currentPage, pageSize, total } = props;
  let showingStart = (currentPage - 1) * pageSize + 1;
  let showingEnd = currentPage * pageSize;
  if (showingEnd > total) {
    showingEnd = total;
  }
  if (total === 0) {
    return <p>{t('Showing 0 Items')}</p>;
  }
  return (
    <p>
      {t('Per Page')} {pageSize} {t('items')} | {t('Showing')} {showingStart} -{' '}
      {showingEnd} {t('of')} {total} {t('items')}
    </p>
  );
};

export default React.memo(PaginationTotalItem);
