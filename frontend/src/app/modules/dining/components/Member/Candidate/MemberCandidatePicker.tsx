import React, {FC, useEffect, useState} from 'react'
import {Modal, Input, Empty, Spin, Tag, Button, Checkbox, Space} from 'antd'
import {MemberApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import {KTIcon} from 'src/_metronic/helpers'

const {Search} = Input

interface IProps {
  open: boolean
  onClose: () => void
  onPick: (candidate: any) => void
  onEnrolled?: () => void
}

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .map((p: string) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

// The NCMS image host is a separate box from its API and is not always reachable from the
// browser, so a photo that fails to load falls back to initials.
const CandidateAvatar: FC<{src?: string; name?: string}> = ({src, name}) => {
  const [broken, setBroken] = useState(false)

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 6}}
      />
    )
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        background: '#d9d9d9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: '#555',
      }}
    >
      {initialsOf(name)}
    </div>
  )
}

const MemberCandidatePicker: FC<IProps> = (props) => {
  const {open, onClose, onPick, onEnrolled} = props
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [list, setList] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])

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
      setSelected([])
    }
  }, [open])

  // Re-pull the roster from NCMS. Safe to press repeatedly: the sync upserts.
  const handleSync = () => {
    setSyncing(true)
    MemberApi.candidateSync()
      .then((res: any) => {
        const {created, updated, deactivated} = res.data ?? {}
        Message.success(
          `Roster synced: ${created ?? 0} new, ${updated ?? 0} updated, ${deactivated ?? 0} removed.`
        )
        setSyncing(false)
        setSelected([])
        loadList('')
      })
      .catch((err: any) => {
        setSyncing(false)
        Message.error(
          err?.status === 422 && typeof err.data === 'string'
            ? err.data
            : 'Could not reach NCMS. Check the network and try again.'
        )
      })
  }

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // Enrolling one at a time doesn't scale past a handful of people, so the batch path reports
  // each row: one duplicate card must not silently drop everyone else in the selection.
  const handleEnrollSelected = () => {
    if (selected.length === 0) {
      return
    }
    setEnrolling(true)
    MemberApi.candidateEnrollBulk(selected)
      .then((res: any) => {
        const {enrolled_count: enrolled, failed_count: failed, failed: failures} = res.data ?? {}
        setEnrolling(false)
        setSelected([])

        if (enrolled > 0) {
          Message.success(`${enrolled} member(s) enrolled.`)
        }
        if (failed > 0) {
          const first = failures?.[0]
          Message.error(
            `${failed} could not be enrolled. ${first ? `${first.name ?? ''}: ${first.reason}` : ''}`
          )
        }

        loadList('')
        onEnrolled?.()
      })
      .catch(() => {
        setEnrolling(false)
        Message.error('Bulk enrollment failed. Please try again.')
      })
  }

  return (
    <Modal
      width={'50%'}
      className='form-page-modal'
      open={open}
      title={'Add Member From API'}
      centered
      onCancel={onClose}
      footer={
        <Space>
          <span className='text-muted me-2'>
            {selected.length > 0 ? `${selected.length} selected` : ''}
          </span>
          <Button onClick={onClose}>Close</Button>
          <Button
            type='primary'
            disabled={selected.length === 0}
            loading={enrolling}
            onClick={handleEnrollSelected}
          >
            Enroll selected
          </Button>
        </Space>
      }
    >
      <div className='d-flex align-items-center mb-4' style={{gap: 8}}>
        <Search
          placeholder='Search by name, staff id or roll no'
          allowClear
          onSearch={(value) => loadList(value)}
          style={{flex: 1}}
        />
        <Button
          icon={<KTIcon iconName='arrows-circle' className='fs-4' />}
          loading={syncing}
          onClick={handleSync}
        >
          Sync from NCMS
        </Button>
      </div>

      {loading ? (
        <div className='d-flex justify-content-center py-10'>
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <Empty description='No candidates available. Try "Sync from NCMS".' />
      ) : (
        <div className='candidate-picker-list' style={{maxHeight: 420, overflowY: 'auto'}}>
          {list.map((candidate: any) => (
            <div
              key={candidate.id}
              className='d-flex align-items-center justify-content-between border-bottom py-3 px-2'
            >
              <div className='d-flex align-items-center' style={{gap: 12}}>
                <Checkbox
                  checked={selected.includes(candidate.id)}
                  onChange={() => toggle(candidate.id)}
                />
                <CandidateAvatar src={candidate.image_url} name={candidate.name} />
                <div>
                  <div className='fw-bold'>{candidate.name}</div>
                  <div className='text-muted fs-7'>
                    <Tag color={candidate.member_type === 'STAFF' ? 'blue' : 'green'}>
                      {candidate.member_type === 'STAFF' ? 'Staff' : 'Student'}
                    </Tag>
                    {candidate.member_type === 'STAFF'
                      ? `Staff ID: ${candidate.staff_id ?? '-'}`
                      : `Roll No: ${candidate.roll_no ?? '-'}`}
                    {/* Whether a card already exists decides if this person can just punch in
                        or needs one issued to them by hand. */}
                    {candidate.has_card ? (
                      <Tag color='green' className='ms-2'>
                        Card {candidate.rfid}
                      </Tag>
                    ) : (
                      <Tag color='orange' className='ms-2'>
                        No card
                      </Tag>
                    )}
                  </div>
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
