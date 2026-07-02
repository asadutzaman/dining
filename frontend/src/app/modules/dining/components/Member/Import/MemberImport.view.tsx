import React, {FC} from 'react'
import {Upload, Button, Alert, List} from 'antd'
import {InboxOutlined} from '@ant-design/icons'

const MemberImportView: FC<any> = (props) => {
  const {file, submitting, result, handleFileSelect, handleRemoveFile, handleImport, handleImportAnother} = props
  const {Dragger} = Upload

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-4'>Import Staff / Student (CSV or XLSX)</h3>
        <p className='text-muted mb-6'>
          Header row must be: <code>member_type,name,phone,email,rfid_card_number,department,designation,class_name,section,roll_no</code>
          <br />
          <code>member_type</code> must be <code>STAFF</code> or <code>STUDENT</code>. Staff rows need{' '}
          <code>department</code> (must already exist); student rows need <code>class_name</code> and{' '}
          <code>roll_no</code>.
        </p>

        <Dragger
          accept='.csv,.xlsx,.xls'
          multiple={false}
          fileList={file ? [file] : []}
          beforeUpload={handleFileSelect}
          onRemove={handleRemoveFile}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>Click or drag a CSV/XLSX file to this area</p>
        </Dragger>

        <div className='mt-6'>
          <Button type='primary' size='large' loading={submitting} disabled={!file} onClick={handleImport}>
            Import
          </Button>
        </div>

        {result && (
          <div className='mt-8'>
            <Alert
              type={result.skipped_rows?.length ? 'warning' : 'success'}
              message={`Imported ${result.imported_count} member(s)${
                result.skipped_rows?.length ? `, ${result.skipped_rows.length} row(s) skipped` : ''
              }.`}
              showIcon
            />
            {result.skipped_rows?.length > 0 && (
              <div className='mt-4'>
                <h5>Skipped Rows</h5>
                <List
                  size='small'
                  bordered
                  dataSource={result.skipped_rows}
                  renderItem={(item: any) => <List.Item>{item}</List.Item>}
                />
              </div>
            )}
            <div className='mt-4'>
              <Button onClick={handleImportAnother}>Import Another File</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(MemberImportView)
