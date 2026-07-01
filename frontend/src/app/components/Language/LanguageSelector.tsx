import {FlagOutlined, SwapOutlined} from '@ant-design/icons'
import clsx from 'clsx'
import {KTIcon, toAbsoluteUrl} from 'src/_metronic/helpers'
import {useLang} from 'src/app/hooks/useLang'

/* eslint-disable jsx-a11y/anchor-is-valid */

const LanguageSelector = ({
  menuPlacement = 'bottom-end',
  menuTrigger = "{default: 'click', lg: 'hover'}",
}) => {
  const {t, lang, changeLanguage} = useLang()
  const onChangeLanguage = (flag) => {
    changeLanguage(flag)
  }

  return (
    <>
      <a
        href='#'
        className={clsx(
          'btn btn-icon fw-bold py-4 fs-6 w-100px ',
          'btn-active-light-primary btn-custom'
        )}
        data-kt-menu-trigger={menuTrigger}
        data-kt-menu-attach='parent'
        data-kt-menu-placement={menuPlacement}
      >
        <div className='d-flex align-items-center'>
          <span className='svg-icon svg-icon-2'>
            {/* <img
              src={
                lang === 'bn'
                  ? toAbsoluteUrl('/media/flags/bd-flag.png')
                  : toAbsoluteUrl('/media/flags/united-states.svg')
              }
              alt='Language'
              style={{width: '20px', height: '20px'}}
            /> */}
            {lang === 'en' ? 'English' : 'বাংলা'}
          </span>
        </div>
      </a>

      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-muted menu-active-bg menu-state-primary fw-semibold py-4 fs-base w-175px'
        data-kt-menu='true'
      >
        <div className='menu-item px-3 my-0'>
          <a
            href='#'
            className={clsx('menu-link px-3 py-2 cursor-pointer symbol', {active: lang === 'en'})}
            onClick={() => onChangeLanguage('en')}
          >
            <span className='menu-title'>{'English'}</span>
          </a>
        </div>

        <div className='menu-item px-3 my-0'>
          <a
            href='#'
            className={clsx('menu-link px-3 py-2 cursor-pointer symbol', {active: lang === 'bn'})}
            onClick={() => onChangeLanguage('bn')}
          >
            <span className='menu-title'>{'বাংলা'}</span>
          </a>
        </div>
      </div>
    </>
  )
}

export {LanguageSelector}
