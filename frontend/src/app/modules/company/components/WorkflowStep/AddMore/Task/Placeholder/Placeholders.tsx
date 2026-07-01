import {useLang} from 'src/app/hooks/useLang'
import {InfoCircleOutlined} from '@ant-design/icons'
import {message} from 'antd'
import React, {FC} from 'react'
import './_Placeholder.scss'

const Placeholders: FC<any> = (props) => {
  const {t} = useLang()

  // https://github.com/mayeenulislam/bangla-lorem-ipsum/blob/v1.0.0/assets/js/core-functions.js#L84
  const clickToCopy = (event) => {
    // Copy to clipboard.
    navigator.clipboard.writeText(event.target.textContent.trim())
    // Anounce.
    message.info(t('Copied to Clipboard'))
    // Deselect.
    event.target.style = 'user-select: none;'
  }

  return (
    <>
      <div role='alert' className='text-info'>
        <p>
          <InfoCircleOutlined className='me-2' />
          {t('Click on the Content Placeholder to copy')}
        </p>
      </div>
      <table className='report-table report-table-bordered'>
        <thead>
          <tr>
            <th>{t('Content Placeholders')}</th>
            <th>{t('Description')}</th>
            <th>{t('Example')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{record.workflow_id}}'}
            </td>
            <td>{t('Workflow Id')}</td>
            <td className='fst-italic text-muted'>{t('99')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{record.workflow_record_id}}'}
            </td>
            <td>{t('Workflow Record Id')}</td>
            <td className='fst-italic text-muted'>{t('99')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{object.workflowTransitionInfo}}'}
            </td>
            <td>{t('Workflow Transition Info (Object)')}</td>
            <td className='fst-italic text-muted'>{t('{id: 1, workflow_record_id: 99}')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{object.workflowTaskList}}'}
            </td>
            <td>{t('Workflow Task List (Object)')}</td>
            <td className='fst-italic text-muted'>{t('{id: 1, status: Approved}')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{object.workflowUpdateFields}}'}
            </td>
            <td>{t('Workflow Update Fields (Object)')}</td>
            <td className='fst-italic text-muted'>{t('{id: 1, amount: 100, currency: BDT}')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{workflow.comment}}'}
            </td>
            <td>{t('Workflow Comment')}</td>
            <td className='fst-italic text-muted'>{t('Test Comment')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{workflow.file}}'}
            </td>
            <td>{t('Workflow File')}</td>
            <td className='fst-italic text-muted'>{t('File Info')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{owner.name}}'}
            </td>
            <td>{t('owner.name, owner.email, owner.phone')}</td>
            <td className='fst-italic text-muted'>{t('Mr. Rahim')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{sender.name}}'}
            </td>
            <td>{t('sender.name, sender.email, sender.phone')}</td>
            <td className='fst-italic text-muted'>{t('Mr. Rahim')}</td>
          </tr>
          <tr>
            <td
              className='click-to-select'
              onClick={(event) => clickToCopy(event)}
              style={{cursor: 'copy'}}
            >
              {'{{URL.SECURITY_UI_URL}}'}
            </td>
            <td>
              {t(
                'SECURITY_UI_URL, GRANT_UI_URL, LICENSE_UI_URL, ETICKET_UI_URL, LIBRARY_UI_URL, VGALLERY_UI_URL, ACCOMMODATION_UI_URL, PROCESS_LEASE_UI_URL, RESEARCH_UI_URL, TRAINING_UI_URL, TESTING_UI_URL, HEALTH_UI_URL, USER_PANEL_UI_URL'
              )}
            </td>
            <td className='fst-italic text-muted'>{t('service.most.test')}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default React.memo(Placeholders)
