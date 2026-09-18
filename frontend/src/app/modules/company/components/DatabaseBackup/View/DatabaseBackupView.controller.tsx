import React, {FC, useState} from 'react'
import download from 'downloadjs'
import {DatabaseBackupApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import {useForm} from 'src/app/hooks/useForm'
import DatabaseBackupView from './DatabaseBackupView.view'

const DatabaseBackupViewController: FC<any> = () => {
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const {formRef, handleChange, handleSubmitFailed} = useForm({})

  const handleDownload = (): void => {
    setDownloading(true)
    DatabaseBackupApi.download()
      .then((res: any) => {
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
        download(new Blob([res.data]), `dining-${stamp}.sql`, {type: 'application/sql'})
        setDownloading(false)
      })
      .catch(() => {
        setDownloading(false)
        Message.error('Could not generate the database backup. Please try again later.')
      })
  }

  const handleSendEmail = (values: any): void => {
    setSending(true)
    DatabaseBackupApi.sendEmail({email: values.email})
      .then(() => {
        Message.success(`Database backup sent to ${values.email}.`)
        setSending(false)
        formRef.resetFields()
      })
      .catch((err: any) => {
        if (err?.status === 422) {
          Message.error(err.data)
        } else {
          Message.error('Could not send the database backup by email. Please try again later.')
        }
        setSending(false)
      })
  }

  return (
    <DatabaseBackupView
      formRef={formRef}
      downloading={downloading}
      sending={sending}
      handleChange={handleChange}
      handleDownload={handleDownload}
      handleSendEmail={handleSendEmail}
      handleSubmitFailed={handleSubmitFailed}
    />
  )
}

export default React.memo(DatabaseBackupViewController)
