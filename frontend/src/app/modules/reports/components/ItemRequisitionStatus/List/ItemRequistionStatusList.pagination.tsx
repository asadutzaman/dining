import React, { FC } from 'react';
import { Row, Col } from 'antd';
import Pagination from 'src/app/components/Pagination/Pagination';
import PaginationTotalItem from 'src/app/components/Pagination/PaginationTotalItem';
import { ItemsPerPageDefaultOptions } from 'src/app/utils/enums';

const ItemRequisitionStatusListPagination: FC<any> = (props) => {
  const { pagination, totalCount, handleOnChanged } = props;
  return (
    <div className="listing-page-pagination px-6 py-3">
      <Row>
        <Col span={12}>
          <div className="footer-total-items">
            <PaginationTotalItem
              currentPage={pagination.currentPage}
              pageSize={pagination.pageSize}
              total={totalCount}
            />
          </div>
        </Col>
        <Col span={12} className="right">
          <Pagination
            pageSizeOptions={ItemsPerPageDefaultOptions}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={totalCount}
            onChangePage={(page, pageSize) =>
              handleOnChanged('pagination_change_page_and_size', page, pageSize)
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(ItemRequisitionStatusListPagination);
