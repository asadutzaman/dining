import React, {FC, useState} from 'react'
import download from 'downloadjs'
import {DatabaseBackupApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import {useForm} from 'src/app/hooks/useForm'
import DatabaseBackupView from './DatabaseBackupView.view'

const DatabaseBackupViewController: FC<any> = () => {
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [restoreFile, setRestoreFile] = useState<any>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
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

  const handleRestoreFileSelect = (selectedFile: any): boolean => {
    setRestoreFile(selectedFile)
    return false
  }

  const handleRestoreFileRemove = (): void => {
    setRestoreFile(null)
  }

  const openConfirm = (): void => {
    if (!restoreFile) {
      Message.error('Please choose a .sql file first.')
      return
    }
    setConfirmOpen(true)
  }

  const closeConfirm = (): void => {
    setConfirmOpen(false)
  }

  const handleConfirmRestore = (): void => {
    setConfirmOpen(false)
    setRestoring(true)
    DatabaseBackupApi.restore(restoreFile)
      .then((res: any) => {
        setRestoring(false)
        setRestoreFile(null)
        Message.success(
          `Database restored successfully. A safety backup of the previous data was saved on the server as ${res.data.safety_backup}.`
        )
      })
      .catch((err: any) => {
        setRestoring(false)
        const errMessage =
          (err?.status === 422 || err?.status === 500) && typeof err.data === 'string'
            ? err.data
            : 'Could not restore the database. Please try again later.'
        Message.error(errMessage)
      })
  }

  return (
    <DatabaseBackupView
      formRef={formRef}
      downloading={downloading}
      sending={sending}
      restoreFile={restoreFile}
      confirmOpen={confirmOpen}
      restoring={restoring}
      handleChange={handleChange}
      handleDownload={handleDownload}
      handleSendEmail={handleSendEmail}
      handleSubmitFailed={handleSubmitFailed}
      handleRestoreFileSelect={handleRestoreFileSelect}
      handleRestoreFileRemove={handleRestoreFileRemove}
      openConfirm={openConfirm}
      closeConfirm={closeConfirm}
      handleConfirmRestore={handleConfirmRestore}
    />
  )
}

export default React.memo(DatabaseBackupViewController)
