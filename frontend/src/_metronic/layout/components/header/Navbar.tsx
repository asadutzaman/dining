import clsx from 'clsx';
import { KTIcon, toAbsoluteUrl } from '../../../helpers';
import { HeaderUserMenu, ThemeModeSwitcher } from '../../../partials';
import { useLayout } from '../../core';
import SwitchOrganizationController from '../../../../app/modules/auth/components/SwitchOrganization/SwitchOrganization.controller';
import { LanguageSelector } from 'src/app/components/Language/LanguageSelector';
import { useContext } from 'react';
import { AuthContext } from 'src/app/context/auth/auth.context';
import { useLang } from 'src/app/hooks/useLang';

const itemClass = 'ms-1 ms-lg-3';
const btnClass =
  'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
const userAvatarClass = 'symbol-35px symbol-md-40px';
const btnIconClass = 'fs-1';

const Navbar = () => {
  const { config } = useLayout();
  const { branchName } = useContext(AuthContext);
  const { t } = useLang();

  return (
    <div className="app-navbar">
      <div className={clsx('app-navbar-item', itemClass)}>
        <div className="cursor-pointer symbol">
          <span className="fs-6 fw-bold text-gray-500">
            {t('Department')}: {branchName}
          </span>
        </div>
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div className="cursor-pointer symbol">
          <LanguageSelector />
        </div>
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <ThemeModeSwitcher
          toggleBtnClass={clsx('btn-active-light-primary btn-custom')}
        />
      </div>

      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className={clsx('cursor-pointer symbol', userAvatarClass)}
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach="parent"
          data-kt-menu-placement="bottom-end"
        >
          <img src={toAbsoluteUrl('/media/avatars/blank.png')} alt="" />
        </div>
        <HeaderUserMenu />
      </div>

      {/* {config.app?.header?.default?.menu?.display && (
        <div
          className="app-navbar-item d-lg-none ms-2 me-n3"
          title="Show header menu"
        >
          <div
            className="btn btn-icon btn-active-color-primary w-35px h-35px"
            id="kt_app_header_menu_toggle"
          >
            <KTIcon iconName="text-align-left" className={btnIconClass} />
          </div>
        </div>
      )} */}
    </div>
  );
};

export { Navbar };
