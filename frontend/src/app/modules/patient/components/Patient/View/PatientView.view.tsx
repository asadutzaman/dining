import React, {FC} from 'react'
import {Tabs, Tag, Descriptions, Badge} from 'antd'
import {DateTimeUtils} from 'src/app/utils'
import EditAction from 'src/app/components/Actions/EditAction'
import DeleteAction from 'src/app/components/Actions/DeleteAction'
import {PatientAction} from '../Actions/Patient.actions'

// Helper to capitalise first letter
const cap = (val: any) => (val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : '—')
const val = (v: any) => v || '—'

const genderColor: Record<string, string> = {
  male: 'blue',
  female: 'pink',
  other: 'purple',
  unknown: 'default',
}

const PatientView: FC<any> = ({itemData, handleCallbackFunc}) => {
  const fullName =
    [itemData.title, itemData.first_name, itemData.middle_name, itemData.last_name]
      .filter(Boolean)
      .join(' ') || '—'

  // ── HEADER SUMMARY ────────────────────────────────────────────────────────
  const header = (
    <div className='d-flex align-items-start gap-6 mb-6 flex-wrap'>
      {/* Avatar placeholder */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#e6f4ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          color: '#1677ff',
          flexShrink: 0,
        }}
      >
        {(itemData.first_name || '?').charAt(0).toUpperCase()}
      </div>

      <div className='flex-grow-1'>
        <div className='d-flex align-items-center gap-3 flex-wrap'>
          <h4 className='mb-0 fw-bold'>{fullName}</h4>
          {itemData.mrn && <Tag color='blue'>MRN: {itemData.mrn}</Tag>}
          {itemData.is_vip && <Tag color='gold'>VIP</Tag>}
          {itemData.is_sensitive && <Tag color='red'>Sensitive</Tag>}
          <Badge
            status={itemData.status === 1 ? 'success' : 'error'}
            text={itemData.status === 1 ? 'Active' : 'Inactive'}
          />
        </div>
        <div className='text-muted mt-1' style={{fontSize: 13}}>
          {itemData.gender && (
            <Tag color={genderColor[itemData.gender] || 'default'} style={{marginRight: 4}}>
              {cap(itemData.gender)}
            </Tag>
          )}
          {itemData.date_of_birth && (
            <span className='me-3'>DOB: {val(itemData.date_of_birth)}</span>
          )}
          {itemData.blood_group && <Tag color='volcano'>{itemData.blood_group}</Tag>}
        </div>
        <div className='mt-1' style={{fontSize: 13}}>
          {itemData.primary_phone && <span className='me-3'>📞 {itemData.primary_phone}</span>}
          {itemData.email && <span>✉️ {itemData.email}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className='d-flex gap-2'>
        <EditAction
          entityId={itemData.id}
          actionItem={PatientAction.COMMON_ACTION.EDIT}
          handleCallbackFunc={handleCallbackFunc}
        />
        <DeleteAction
          entityId={itemData.id}
          actionItem={PatientAction.COMMON_ACTION.DELETE}
          handleCallbackFunc={handleCallbackFunc}
        />
      </div>
    </div>
  )

  // ── TAB: PERSONAL ─────────────────────────────────────────────────────────
  const personalTab = (
    <Descriptions bordered column={2} size='small'>
      <Descriptions.Item label='MRN'>{val(itemData.mrn)}</Descriptions.Item>
      <Descriptions.Item label='Title'>{val(itemData.title)}</Descriptions.Item>
      <Descriptions.Item label='First Name'>{val(itemData.first_name)}</Descriptions.Item>
      <Descriptions.Item label='Middle Name'>{val(itemData.middle_name)}</Descriptions.Item>
      <Descriptions.Item label='Last Name'>{val(itemData.last_name)}</Descriptions.Item>
      <Descriptions.Item label='Date of Birth'>{val(itemData.date_of_birth)}</Descriptions.Item>
      <Descriptions.Item label='Gender'>{cap(itemData.gender)}</Descriptions.Item>
      <Descriptions.Item label='Blood Group'>{val(itemData.blood_group)}</Descriptions.Item>
      <Descriptions.Item label='Marital Status'>{cap(itemData.marital_status)}</Descriptions.Item>
      <Descriptions.Item label='Religion'>{cap(itemData.religion)}</Descriptions.Item>
      <Descriptions.Item label='Nationality'>{val(itemData.nationality)}</Descriptions.Item>
      <Descriptions.Item label='Occupation'>{val(itemData.occupation)}</Descriptions.Item>
      <Descriptions.Item label='Registration Date' span={2}>
        {DateTimeUtils.formatDateTimeA(itemData.registration_date)}
      </Descriptions.Item>
    </Descriptions>
  )

  // ── TAB: CONTACT ──────────────────────────────────────────────────────────
  const contactTab = (
    <Descriptions bordered column={2} size='small'>
      <Descriptions.Item label='Primary Phone'>{val(itemData.primary_phone)}</Descriptions.Item>
      <Descriptions.Item label='Secondary Phone'>{val(itemData.secondary_phone)}</Descriptions.Item>
      <Descriptions.Item label='Email' span={2}>{val(itemData.email)}</Descriptions.Item>
      <Descriptions.Item label='Emergency Contact Name'>{val(itemData.emergency_contact_name)}</Descriptions.Item>
      <Descriptions.Item label='Emergency Contact Phone'>{val(itemData.emergency_contact_phone)}</Descriptions.Item>
      <Descriptions.Item label='Emergency Relation' span={2}>{val(itemData.emergency_contact_relation)}</Descriptions.Item>
    </Descriptions>
  )

  // ── TAB: ADDRESS ──────────────────────────────────────────────────────────
  const addressTab = (
    <div>
      <p className='fw-semibold text-muted mb-2'>Current Address</p>
      <Descriptions bordered column={2} size='small' className='mb-6'>
        <Descriptions.Item label='Address' span={2}>{val(itemData.current_address)}</Descriptions.Item>
        <Descriptions.Item label='City'>{val(itemData.current_city)}</Descriptions.Item>
        <Descriptions.Item label='State'>{val(itemData.current_state)}</Descriptions.Item>
        <Descriptions.Item label='Country'>{val(itemData.current_country)}</Descriptions.Item>
        <Descriptions.Item label='Pincode'>{val(itemData.current_pincode)}</Descriptions.Item>
      </Descriptions>
      <p className='fw-semibold text-muted mb-2'>Permanent Address</p>
      <Descriptions bordered column={2} size='small'>
        <Descriptions.Item label='Address' span={2}>{val(itemData.permanent_address)}</Descriptions.Item>
        <Descriptions.Item label='City'>{val(itemData.permanent_city)}</Descriptions.Item>
        <Descriptions.Item label='State'>{val(itemData.permanent_state)}</Descriptions.Item>
        <Descriptions.Item label='Country'>{val(itemData.permanent_country)}</Descriptions.Item>
        <Descriptions.Item label='Pincode'>{val(itemData.permanent_pincode)}</Descriptions.Item>
      </Descriptions>
    </div>
  )

  // ── TAB: MEDICAL HISTORY ──────────────────────────────────────────────────
  const medicalTab = (
    <Descriptions bordered column={1} size='small'>
      <Descriptions.Item label='Known Allergies'>
        {itemData.known_allergies ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.known_allergies}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Chronic Diseases'>
        {itemData.chronic_diseases ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.chronic_diseases}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Current Medications'>
        {itemData.current_medications ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.current_medications}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Surgical History'>
        {itemData.surgical_history ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.surgical_history}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Family Medical History'>
        {itemData.family_medical_history ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.family_medical_history}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Social History'>
        {itemData.social_history ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.social_history}</span>
        ) : '—'}
      </Descriptions.Item>
    </Descriptions>
  )

  // ── TAB: INSURANCE ────────────────────────────────────────────────────────
  const insuranceTab = (
    <Descriptions bordered column={2} size='small'>
      <Descriptions.Item label='Provider'>{val(itemData.insurance_provider)}</Descriptions.Item>
      <Descriptions.Item label='Policy Number'>{val(itemData.insurance_policy_number)}</Descriptions.Item>
      <Descriptions.Item label='Valid From'>{val(itemData.insurance_valid_from)}</Descriptions.Item>
      <Descriptions.Item label='Valid To'>{val(itemData.insurance_valid_to)}</Descriptions.Item>
      <Descriptions.Item label='Group Number'>{val(itemData.insurance_group_number)}</Descriptions.Item>
      <Descriptions.Item label='Insurance Phone'>{val(itemData.insurance_phone)}</Descriptions.Item>
    </Descriptions>
  )

  // ── TAB: FLAGS & NOTES ────────────────────────────────────────────────────
  const flagsTab = (
    <Descriptions bordered column={2} size='small'>
      <Descriptions.Item label='VIP Patient'>
        <Badge status={itemData.is_vip ? 'success' : 'default'} text={itemData.is_vip ? 'Yes' : 'No'} />
      </Descriptions.Item>
      <Descriptions.Item label='Sensitive Patient'>
        <Badge status={itemData.is_sensitive ? 'warning' : 'default'} text={itemData.is_sensitive ? 'Yes' : 'No'} />
      </Descriptions.Item>
      <Descriptions.Item label='Consent Signed'>
        <Badge status={itemData.consent_signed ? 'success' : 'error'} text={itemData.consent_signed ? 'Yes' : 'No'} />
      </Descriptions.Item>
      <Descriptions.Item label='Consent Signed At'>
        {DateTimeUtils.formatDateTimeA(itemData.consent_signed_at)}
      </Descriptions.Item>
      <Descriptions.Item label='Special Notes' span={2}>
        {itemData.special_notes ? (
          <span style={{whiteSpace: 'pre-wrap'}}>{itemData.special_notes}</span>
        ) : '—'}
      </Descriptions.Item>
      <Descriptions.Item label='Total Visits'>{val(itemData.total_visits)}</Descriptions.Item>
      <Descriptions.Item label='Last Visit'>{DateTimeUtils.formatDateTimeA(itemData.last_visit_date)}</Descriptions.Item>
    </Descriptions>
  )

  const tabItems = [
    {key: 'personal', label: 'Personal', children: personalTab},
    {key: 'contact', label: 'Contact', children: contactTab},
    {key: 'address', label: 'Address', children: addressTab},
    {key: 'medical', label: 'Medical History', children: medicalTab},
    {key: 'insurance', label: 'Insurance', children: insuranceTab},
    {key: 'flags', label: 'Flags & Notes', children: flagsTab},
  ]

  return (
    <div className='patient-view-container'>
      {header}
      <Tabs items={tabItems} type='card' size='small' />
    </div>
  )
}

export default React.memo(PatientView)
