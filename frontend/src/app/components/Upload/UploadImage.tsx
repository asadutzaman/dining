import React, {useState, useEffect} from 'react'
import {Upload, Tooltip, Button} from 'antd'
import {LoadingOutlined, PlusOutlined, DeleteOutlined} from '@ant-design/icons'
import {FileApi} from '../../api'
import {CONSTANT_CONFIG} from '../../constants'
import {Message} from '../../utils'
import './Upload.style.scss'

interface IProps {
  imageId?: any
  imageList: any
  setImageList: any
  [key: string]: any
}

const UploadImage: React.FC<IProps> = (props) => {
  const {imageId, imageList, setImageList} = props
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)

  useEffect(() => {
    if (imageId) {
      FileApi.getImageById(imageId)
        .then((res) => {
          let fileInfo = {
            uid: `${res.data.file_id}`,
            file_id: res.data.file_id,
            name: res.data.original_filename,
            url: CONSTANT_CONFIG.MEDIA_SOURCE + res.data.file_id,
          }
          setImageList([fileInfo])
          setUploadLoading(false)
        })
        .catch((err) => {
          setUploadLoading(false)
        })
    }
  }, [imageId])

  const handleChangeFile = (info: any) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true)
      return
    }
    if (info.file.status === 'error') {
      setUploadLoading(false)
      return
    }
    if (info.file.status === 'done') {
      setUploadLoading(false)
      return
    }
  }

  const handleBeforeUploadFile = (file: File, FileList: File[]) => {
    const MAX_UPLOAD_SIZE = 2000000
    const isFileTypeOk =
      file.type === 'image/jpg' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/bmp' ||
      file.type === 'image/gif'
    const isFileSizeOk = file.size < MAX_UPLOAD_SIZE

    if (!isFileTypeOk) {
      Message.error('You can only upload JPG,PNG,GIF file!')
    } else if (!isFileSizeOk) {
      // Message.error('Image must smaller than 2MB!');
    }

    // return isFileTypeOk && isFileSizeOk;
    return isFileTypeOk
  }

  const handleRemoveUploadFile = (event: any, fileId: any) => {
    event.stopPropagation()
    setImageList((prevFileList: any) => {
      return prevFileList.filter((item: any) => item.file_id !== fileId)
    })
  }

  const handleImageUpload = (name: string, file: any) => {
    setUploadLoading(true)
    FileApi.upload(file)
      .then((res) => {
        let fileInfo = {
          uid: `${res.data.uid}`,
          file_id: res.data.file_id,
          name: res.data.original_filename,
          url: CONSTANT_CONFIG.MEDIA_SOURCE + res.data.file_id,
        }
        setImageList([fileInfo])
        setUploadLoading(false)
      })
      .catch((err) => {
        setUploadLoading(false)
      })
  }

  return (
    <>
      <Upload
        name='image_uploader'
        accept='.jpg,.jpeg,.png,.gif,.bmp'
        listType='picture-card'
        className='image-uploader'
        showUploadList={false}
        maxCount={1}
        onChange={handleChangeFile}
        beforeUpload={handleBeforeUploadFile}
        customRequest={({file}) => handleImageUpload('file', file)}
      >
        {imageList?.length ? (
          <>
            <img
              src={imageList[0].url}
              alt=''
              height={90}
              style={{maxWidth: '100%', padding: '0 7px'}}
            />
            <Tooltip title='Delete'>
              <DeleteOutlined
                className='iconDelete'
                type='delete'
                onClick={(event) => handleRemoveUploadFile(event, imageList[0]?.file_id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  padding: '2px',
                  color: 'red',
                }}
              />
            </Tooltip>
          </>
        ) : (
          <>
            <div className='ant-upload-text'>
              {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{marginTop: 8}}>Upload</div>
            </div>
          </>
        )}
      </Upload>
    </>
  )
}

export default React.memo(UploadImage)
