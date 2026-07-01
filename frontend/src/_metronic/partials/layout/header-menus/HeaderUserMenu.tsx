/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { toAbsoluteUrl } from '../../../helpers';
import { AuthContext } from '../../../../app/context/auth/auth.context';
import { useLang } from 'src/app/hooks/useLang';

const HeaderUserMenu: FC = () => {
  const { userName, userEmail } = useContext(AuthContext);
  const { t } = useLang();

  return (
    <div
      className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
      data-kt-menu="true"
    >
      <div className="menu-item px-3">
        <div className="menu-content d-flex align-items-center px-3">
          <div className="symbol symbol-50px me-5">
            <img alt="Logo" src={toAbsoluteUrl('/media/avatars/blank.png')} />
          </div>

          <div className="d-flex flex-column">
            <div className="fw-bolder d-flex align-items-center fs-5">
              {userName}
              {/* <span className='badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2'>Pro</span> */}
            </div>
            <a href="#" className="fw-bold text-muted text-hover-primary fs-7">
              {userEmail}
            </a>
          </div>
        </div>
      </div>

      <div className="separator my-2"></div>

      {/* <div className='menu-item px-5'>
        <Link to={'/admin/setting/profile/own-profile'} className='menu-link px-5'>
          My Profile
        </Link>
      </div> */}

      <div className="menu-item px-5 my-1">
        <Link
          to="/admin/setting/profile/change-password"
          className="menu-link px-5"
        >
          {t('Change Password')}
        </Link>
      </div>

      <div className="separator my-2"></div>

      <div className="menu-item px-5">
        <NavLink className="menu-link px-5" to={'/auth/logout'}>
          {t('Sign Out')}
        </NavLink>
      </div>
    </div>
  );
};

export { HeaderUserMenu };
