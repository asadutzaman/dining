import React, {FC, useState} from 'react'
import {MemberApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import MemberImportView from './MemberImport.view'

const MemberImportController: FC = () => {
  const [file, setFile] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileSelect = (selectedFile: any) => {
    setFile(selectedFile)
    setResult(null)
    return false
  }

  const handleRemoveFile = () => {
    setFile(null)
    setResult(null)
  }

  const handleImport = () => {
    if (!file) {
      Message.error('Please choose a CSV/XLSX file first.')
      return
    }

    setSubmitting(true)
    MemberApi.bulkImport(file)
      .then((res: any) => {
        setSubmitting(false)
        setResult(res.data)
        Message.success(`Imported ${res.data.imported_count} member(s).`)
      })
      .catch((err: any) => {
        setSubmitting(false)
        const errMessage =
          err?.status === 422 && typeof err.data === 'string' ? err.data : 'A network error occurred. Please try again later.'
        Message.error(errMessage)
      })
  }

  const handleImportAnother = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <MemberImportView
      file={file}
      submitting={submitting}
      result={result}
      handleFileSelect={handleFileSelect}
      handleRemoveFile={handleRemoveFile}
      handleImport={handleImport}
      handleImportAnother={handleImportAnother}
    />
  )
}

export default MemberImportController
