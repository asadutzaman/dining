/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { toAbsoluteUrl } from '../../../_metronic/helpers';

const AuthLayout = () => {
  useEffect(() => {
    document.body.classList.add('bg-body');
    return () => {
      document.body.classList.remove('bg-body');
    };
  }, []);

  return (
    // Change In Existing Code
    // <div
    //   className="d-flex flex-column flex-column-fluid flex-lg-row h-100"
    //   // style={{
    //   //   backgroundImage: `url(${toAbsoluteUrl('/media/illustrations/sketchy-1/14.png')})`,
    //   // }}
    // >
    //   {/* begin::Content */}
    //   <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
    //     {/* begin::Logo */}
    //     {/* <a href="#" className="mb-12">
    //       <img
    //         alt="Logo"
    //         src={toAbsoluteUrl('/media/logos/default.svg')}
    //         className="h-45px"
    //       />
    //     </a> */}
    //     {/* end::Logo */}
    //     {/* begin::Wrapper */}
    //     <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
    //       <Outlet />
    //     </div>
    //     {/* end::Wrapper */}
    //   </div>
    //   {/* end::Content */}

    //   {/* begin::Aside */}
    //   <div
    //     className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
    //     style={{
    //       backgroundImage: `url(${toAbsoluteUrl('/media/misc/auth-bg.png')})`,
    //     }}
    //   >
    //     {/* begin::Content */}
    //     <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
    //       {/* begin::Image */}
    //       <img
    //         className="mx-auto w-225px w-md-50 w-xl-500px mb-lg-20"
    //         src={toAbsoluteUrl('/media/misc/auth-screens.svg')}
    //         alt=""
    //       />
    //       {/* end::Image */}
    //     </div>
    //     {/* end::Content */}
    //   </div>
    //   {/* end::Aside */}

    //   {/* begin::Footer */}
    //   {/* <div className='d-flex flex-center flex-column-auto p-10'>
    //     <div className='d-flex align-items-center fw-bold fs-6'>
    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         About
    //       </a>

    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         Contact
    //       </a>

    //       <a href='#' className='text-muted text-hover-primary px-2'>
    //         Contact Us
    //       </a>
    //     </div>
    //   </div> */}
    //   {/* end::Footer */}
    // </div>

    // Taken Code from CCC
    <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
      {/* begin::Body */}
      <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
        {/* begin::Form */}
        <div className="d-flex flex-center flex-column flex-lg-row-fluid">
          {/* begin::Wrapper */}
          <div className="w-lg-500px px-10">
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}
      </div>
      {/* end::Body */}

      {/* begin::Aside */}
      <div
        className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
        style={{
          backgroundImage: `url(${toAbsoluteUrl('/media/misc/auth-bg.png')})`,
        }}
      >
        {/* begin::Content */}
        <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
          {/* begin::Image */}
          <img
            className="mx-auto w-225px w-md-50 w-xl-500px mb-lg-20"
            src={toAbsoluteUrl('/media/misc/auth-screens.svg')}
            alt=""
          />
          {/* end::Image */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::Aside */}
    </div>
  );
};

export { AuthLayout };
