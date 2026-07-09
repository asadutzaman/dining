import React, {FC, useEffect, useState} from 'react'
import {Modal, Input, Empty, Spin, Tag, Button} from 'antd'
import {MemberApi} from 'src/app/api'
import {KTIcon} from 'src/_metronic/helpers'

const {Search} = Input

interface IProps {
  open: boolean
  onClose: () => void
  onPick: (candidate: any) => void
}

const MemberCandidatePicker: FC<IProps> = (props) => {
  const {open, onClose, onPick} = props
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<any[]>([])

  const loadList = (search: string = '') => {
    setLoading(true)
    MemberApi.candidateList({$search: search, $top: 50, $skip: 0})
      .then((res: any) => {
        setList(res.data.results || [])
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setLoading(false)
      })
  }

  useEffect(() => {
    if (open) {
      loadList('')
    } else {
      setList([])
    }
  }, [open])

  return (
    <Modal
      width={'50%'}
      className='form-page-modal'
      open={open}
      title={'Add Member From API'}
      centered
      onCancel={onClose}
      footer={null}
    >
      <Search
        placeholder='Search by name, staff id or roll no'
        allowClear
        onSearch={(value) => loadList(value)}
        style={{marginBottom: 16}}
      />

      {loading ? (
        <div className='d-flex justify-content-center py-10'>
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <Empty description='No candidates available' />
      ) : (
        <div className='candidate-picker-list' style={{maxHeight: 420, overflowY: 'auto'}}>
          {list.map((candidate: any) => (
            <div
              key={candidate.id}
              className='d-flex align-items-center justify-content-between border-bottom py-3 px-2'
            >
              <div>
                <div className='fw-bold'>{candidate.name}</div>
                <div className='text-muted fs-7'>
                  <Tag color={candidate.member_type === 'STAFF' ? 'blue' : 'green'}>
                    {candidate.member_type === 'STAFF' ? 'Staff' : 'Student'}
                  </Tag>
                  {candidate.member_type === 'STAFF'
                    ? `Staff ID: ${candidate.staff_id ?? '-'}`
                    : `Roll No: ${candidate.roll_no ?? '-'}`}
                </div>
              </div>
              <Button
                type='primary'
                size='small'
                icon={<KTIcon iconName='plus' className='fs-4' />}
                onClick={() => onPick(candidate)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default React.memo(MemberCandidatePicker)
