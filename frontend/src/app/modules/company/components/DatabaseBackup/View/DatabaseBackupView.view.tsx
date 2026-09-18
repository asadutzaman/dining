import React, {FC, useState} from 'react'
import {Alert, Button, Col, Divider, Form, Input, Modal, Row, Upload} from 'antd'
import {DownloadOutlined, InboxOutlined, MailOutlined, WarningOutlined} from '@ant-design/icons'
import {useLang} from 'src/app/hooks/useLang'

const {Dragger} = Upload
const RESTORE_CONFIRM_PHRASE = 'RESTORE'

const formItemLayout = {
  labelCol: {
    xs: {span: 8},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 16},
    sm: {span: 16},
  },
}

const DatabaseBackupView: FC<any> = (props) => {
  const {
    formRef,
    downloading,
    sending,
    restoreFile,
    confirmOpen,
    restoring,
    handleChange,
    handleDownload,
    handleSendEmail,
    handleSubmitFailed,
    handleRestoreFileSelect,
    handleRestoreFileRemove,
    openConfirm,
    closeConfirm,
    handleConfirmRestore,
  } = props
  const {t} = useLang()
  const [confirmText, setConfirmText] = useState('')

  const handleCloseConfirm = (): void => {
    setConfirmText('')
    closeConfirm()
  }

  const handleConfirmClick = (): void => {
    setConfirmText('')
    handleConfirmRestore()
  }

  return (
    <div className='card'>
      <div className='card card-header p-6'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>{t('Database Backup')}</span>
        </h3>
      </div>

      <div className='grid-form-content form-page-content-resource p-6'>
        <Row gutter={[16, 16]}>
          <Divider orientation='left' orientationMargin='0'>
            {t('Download')}
          </Divider>
          <Col span={24}>
            <p>{t('Download a full backup of the database as a .sql file.')}</p>
            <Button
              type='primary'
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownload}
            >
              {t('Download Full Database (.sql)')}
            </Button>
          </Col>
        </Row>

        <Form
          {...formItemLayout}
          layout='horizontal'
          form={formRef}
          name='databaseBackupEmailForm'
          scrollToFirstError={true}
          onValuesChange={handleChange}
          onFinish={handleSendEmail}
          onFinishFailed={handleSubmitFailed}
          className='mx-auto'
        >
          <Row gutter={[16, 16]}>
            <Divider orientation='left' orientationMargin='0'>
              {t('Send By Email')}
            </Divider>
            <Col span={24}>
              <p>{t('Email the same backup file to an address of your choice.')}</p>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('Email')}
                name='email'
                rules={[
                  {required: true, message: 'This field is required.'},
                  {type: 'email', message: 'Provide valid email'},
                  {max: 100, message: 'Maximum character is 100'},
                ]}
              >
                <Input placeholder='name@example.com' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Button
                type='primary'
                htmlType='submit'
                icon={<MailOutlined />}
                className='submit-loading-button'
                loading={sending}
              >
                {t('Send By Email')}
              </Button>
            </Col>
          </Row>
        </Form>

        <Row gutter={[16, 16]}>
          <Divider orientation='left' orientationMargin='0'>
            {t('Restore From Upload')}
          </Divider>
          <Col span={24}>
            <Alert
              type='error'
              showIcon
              icon={<WarningOutlined />}
              message={t('This replaces the entire database')}
              description={t(
                'Every current member, token and payment is immediately overwritten by the uploaded file. A safety backup of the current data is taken automatically first, but there is no other undo.'
              )}
              className='mb-4'
            />
            <Dragger
              accept='.sql'
              multiple={false}
              fileList={restoreFile ? [restoreFile] : []}
              beforeUpload={handleRestoreFileSelect}
              onRemove={handleRestoreFileRemove}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>{t('Click or drag a .sql file to this area')}</p>
            </Dragger>
            <Button
              danger
              type='primary'
              className='mt-4'
              loading={restoring}
              disabled={!restoreFile}
              onClick={openConfirm}
            >
              {t('Restore Database')}
            </Button>
          </Col>
        </Row>
      </div>

      <Modal
        title={t('Confirm database restore')}
        open={confirmOpen}
        onCancel={handleCloseConfirm}
        okText={t('Restore Database')}
        okButtonProps={{danger: true, disabled: confirmText !== RESTORE_CONFIRM_PHRASE}}
        onOk={handleConfirmClick}
        destroyOnClose
      >
        <p>
          {t(
            'This will immediately delete all current members, tokens and payments and replace them with the uploaded file. This cannot be undone from the panel.'
          )}
        </p>
        <p>
          {t('Type')} <b>{RESTORE_CONFIRM_PHRASE}</b> {t('below to confirm.')}
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={RESTORE_CONFIRM_PHRASE}
          autoFocus
        />
      </Modal>
    </div>
  )
}
export default React.memo(DatabaseBackupView)
