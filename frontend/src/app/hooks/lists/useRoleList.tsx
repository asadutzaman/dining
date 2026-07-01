import {useState, useEffect, useContext} from 'react'
import {ListContext} from '../../context/list/list.context'
import {RoleApi} from '../../api'

export const useRoleList = (isPreloaded: boolean = true) => {
  //   const {roleListContext, setRoleListContext} = useContext(ListContext)

  const [roleList, setRoleList] = useState<any>([])
  const [activeRoleList, setActiveRoleList] = useState<any>([])
  const [loadingRoleList, setLoadingRoleList] = useState<boolean>(false)

  useEffect(() => {
    if (isPreloaded && roleList.length) {
      setRoleList(roleList)
      loadActiveRoleList(roleList)
    } else {
      loadRoleList()
    }
  }, [])

  const loadRoleList = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingRoleList(true)
      const payload = {
        $select: 'id,name,status',
        $orderby: 'name asc',
      }
      RoleApi.dropdown(payload)
        .then((res) => {
          prepareListData(res.data.results)
          resolve(res.data)
        })
        .catch((err) => {
          reject(err)
        })
        .finally(() => {
          setLoadingRoleList(false)
        })
    })
  }

  const prepareListData = (list: any) => {
    setRoleList(list)
    loadActiveRoleList(list)
    // if (isPreloaded) {
    //   setRoleListContext(list)
    // }
  }

  const loadActiveRoleList = (list: any) => {
    const activeList = list.filter((item: any) => item.status === 1)
    setActiveRoleList(activeList)
  }

  const getRoleById = (id: any) => {
    if (!roleList) {
      return
    }
    return roleList.find((item: any) => item.id === id)
  }

  return {loadingRoleList, loadRoleList, roleList, activeRoleList, getRoleById}
}
