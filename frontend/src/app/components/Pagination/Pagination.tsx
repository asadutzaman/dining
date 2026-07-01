import React, { FC } from 'react'
import { Pagination as AntPagination } from 'antd';

type Props = {
    currentPage: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: string[];

    onChangePage: (page: number, pageSize?: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
};

const Pagination: React.FC<Props> = (props: Props) => {
    const { currentPage, pageSize, total, pageSizeOptions } = props;

    function handleChange(page: any, pageSize: any) {
        props.onChangePage(page, pageSize);
    }

    /*function handleShowSizeChange(current, pageSize) {
        props.onShowSizeChange(current, pageSize);
    }*/

    return (
        <div className="pagination-container">
            <AntPagination
                showSizeChanger
                onShowSizeChange={handleChange}
                onChange={handleChange}
                current={currentPage}
                pageSize={pageSize}
                total={total}
                pageSizeOptions={pageSizeOptions}
            />
        </div>
    )
}

export default React.memo(Pagination);