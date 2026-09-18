import React, {FC} from 'react'
import {Button, Col, Divider, Form, Input, Row} from 'antd'
import {DownloadOutlined, MailOutlined} from '@ant-design/icons'
import {useLang} from 'src/app/hooks/useLang'

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
    handleChange,
    handleDownload,
    handleSendEmail,
    handleSubmitFailed,
  } = props
  const {t} = useLang()

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
      </div>
    </div>
  )
}
export default React.memo(DatabaseBackupView)
