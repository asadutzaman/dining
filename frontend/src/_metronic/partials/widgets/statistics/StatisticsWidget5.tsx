/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {KTIcon} from '../../../helpers'
import {Link} from 'react-router-dom'

type Props = {
  navigateTo?: string
  className: string
  color: string
  svgIcon: string
  iconColor: string
  title: string
  titleColor?: string
  titleFront?: string
  description: string
  descriptionColor?: string
}

const StatisticsWidget5: React.FC<Props> = ({
  navigateTo = '#',
  className,
  color,
  svgIcon,
  iconColor,
  title,
  titleColor,
  titleFront = 'fs-2x',
  description,
  descriptionColor,
}) => {
  return (
    <Link to={navigateTo} className={`card bg-${color} hoverable ${className}`}>
      <div className='card-body'>
        {/* <KTIcon iconName={svgIcon} className={`text-${iconColor} fs-3x ms-n1`} /> */}

        <div className={`text-${titleColor} fw-bolder ${titleFront} mb-2 mt-5`}>{title}</div>

        <div className={`fw-semibold fs-4 text-${descriptionColor}`}>{description}</div>
      </div>
    </Link>
  )
}

export {StatisticsWidget5}
