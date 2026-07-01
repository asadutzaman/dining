import React, {FC, useEffect, useState} from 'react'
import {useLang} from 'src/app/hooks/useLang'
import {Tree} from 'antd'
import {BranchApi} from 'src/app/api'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'

const BranchTreeListing: FC<any> = (props) => {
  const {t} = useLang()
  const [showLine, setShowLine] = useState<boolean | {showLeafIcon: boolean}>(true)
  const [showIcon, setShowIcon] = useState<boolean>(false)
  const [branchTreeData, setBranchTreeData] = useState<any[]>([])
  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    loadBranchTree()
  }, [])

  const loadBranchTree = () => {
    BranchApi.getBranchTree()
      .then((res) => {
        setBranchTreeData(res.data)
      })
      .catch((err) => {
        handleErrorMessage(err)
      })
  }

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    console.log('selected', selectedKeys, info)
  }

  return (
    <div className='px-6'>
      {branchTreeData && (
        <Tree
          treeData={branchTreeData}
          showLine={showLine}
          showIcon={showIcon}
          defaultExpandedKeys={['key-1']}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

export default React.memo(BranchTreeListing)
