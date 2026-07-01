import {FC, useContext, useEffect} from 'react'
import {useIdleTimer} from 'react-idle-timer'
import {Navigate, Outlet, useLocation, useNavigate} from 'react-router-dom'
import {AuthContext} from '../../context/auth/auth.context'

const ProtectedAdminRoute: FC<any> = ({
  layout: Layout,
  component: Component,
  permission,
  ...rest
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {isAuthReady, isAuthenticated, isAdmin} = useContext(AuthContext)

  const hasPermission = false

  useEffect(() => {
    if (isAuthReady === true && isAuthenticated === false && isAdmin === false) {
      const redirectUrl = encodeURI(`${location.pathname}${location.search}`)
      localStorage.setItem('redirectUrl', redirectUrl)
      navigate(`/auth/login`)
    }
  }, [isAuthenticated, isAdmin])

  const handleOnIdle = () => {
    if (isAuthenticated === true && isAdmin === true) {
      // Perform logout or other actions
      navigate('/auth/logout')
    }
  }

  useIdleTimer({
    timeout: 1000 * 60 * 30, // (1000 * 1) = 1 seconds, (1000 * 60) = 1 minute, (1000 * 60 * 60) = 1 hour
    onIdle: handleOnIdle,
    debounce: 500, // Optional: smoothens event firing
  })

  if (permission && hasPermission) {
    return <Navigate to={`/admin/access/denied`} />
  }

  if (isAuthenticated === true && isAdmin === true) {
    return <Outlet />
  }

  return null
}

export default ProtectedAdminRoute
