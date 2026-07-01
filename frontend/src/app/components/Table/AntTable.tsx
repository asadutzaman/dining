import React, { FC, useEffect, useState } from 'react'
import { Table } from 'antd'
import { usePermissionContext } from "../../hooks/context/usePermissionContext";
import useResponsive from "../../hooks/useResponsive";

interface Props {
    className?: string,
    rowKey?: string,
    rowSelection?: boolean,
    rowSelectionPermission?: string,
    selectedRowKeys?: any[],
    dataSource: any[],
    columns: any[],
    mobileColumns?: any[],
    pagination?: {},
    loading?: boolean,
    bordered?: boolean,
    summary?: any,
    footer?: any,
    scroll?: any,
    onChange?: (pagination: any, filters: any, sorter: any, extra: any) => void,
    handleOnChanged: (fieldName: string, value: any, text?: any) => void,
}

const AntTable: FC<Props> = (props: Props) => {
    const { isMobile } = useResponsive();
    const { isPermissionLoaded, hasPermission } = usePermissionContext();

    const {
        className = 'table-layout',
        rowKey = 'id',
        rowSelection = true,
        rowSelectionPermission = '',
        selectedRowKeys,
        dataSource,
        columns,
        mobileColumns,
        pagination = false,
        loading = false,
        onChange,
        handleOnChanged,
        bordered = false,
        summary,
        footer = false,
        scroll = { x: '100%' }
    } = props;

    const [antRowSelection, setAntRowSelection] = useState<any>(undefined);
    const [filterColumns, setFilterColumns] = useState<any>(columns);

    useEffect(() => {
        if (isPermissionLoaded) {
            let newFilterColumns = columns.filter(function (item) {
                return hasPermission(item?.permission);
            });
            setFilterColumns(newFilterColumns)
        }
        if (rowSelection && isPermissionLoaded && hasPermission(rowSelectionPermission)) {
            setAntRowSelection({
                selectedRowKeys,
                onChange: (values: any) => { handleOnChanged('selected_row_keys', values) },
            })
        }
    }, [isPermissionLoaded, columns, selectedRowKeys])

    return (
        <Table
            className={className}
            rowKey={record => record[rowKey].toString()}
            rowClassName={(record, index) => (index % 2 === 0 ? 'odd' : 'even')}
            rowSelection={antRowSelection}
            dataSource={dataSource}
            columns={isMobile && mobileColumns ? mobileColumns : filterColumns}
            pagination={pagination}
            loading={loading}
            onChange={onChange}
            bordered={bordered}
            summary={summary}
            footer={footer}
            scroll={scroll}
        />
    );
}

export default AntTable;

