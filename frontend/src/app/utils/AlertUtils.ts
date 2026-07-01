import {message as _message, notification as _notification, Modal as _Modal} from 'antd'

export class Message {
  public info = (content: string, duration: number = 2) => {
    _message.info(content, duration)
  }

  public success = (content: string, duration: number = 2) => {
    _message.success(content, duration)
  }

  public error = (content: string, duration: number = 2) => {
    _message.error(content, duration)
  }

  public warning = (content: string, duration: number = 2) => {
    _message.warning(content, duration)
  }

  public loading = (content: string, duration: number = 2) => {
    _message.loading(content, duration)
  }
}

export class Notification {
  public open = (msg: string, description: string) => {
    _notification.open({
      message: msg,
      description: description,
    })
  }

  public success = (msg: string, description: string) => {
    _notification.success({
      message: msg,
      description: description,
    })
  }

  public info = (msg: string, description: string) => {
    _notification.info({
      message: msg,
      description: description,
    })
  }

  public warning = (msg: string, description: string) => {
    _notification.warning({
      message: msg,
      description: description,
    })
  }

  public error = (msg: string, description: string) => {
    _notification.error({
      message: msg,
      description: description,
    })
  }
}

export class AntModal {
  public open = (content: string) => {
    _Modal.info({
      icon: null,
      content: content,
      centered: true,
    })
  }

  public info = (title: string, content: string) => {
    _Modal.info({
      title: title,
      content: content,
    })
  }

  public success = (content: string) => {
    _Modal.success({
      content: content,
    })
  }

  public error = (title: string, content: string) => {
    _Modal.error({
      title: title,
      content: content,
    })
  }

  public warning = (title: string, content: string) => {
    _Modal.warning({
      title: title,
      content: content,
    })
  }

  public confirm = (
    title: string,
    content: string,
    value: any,
    callback: (value: any, action?: any) => void,
    okText: string = 'OK',
    cancelText: string = 'Cancel'
  ) => {
    _Modal.confirm({
      title: title,
      content: content,
      okText: okText,
      cancelText: cancelText,
      centered: true,
      onOk: () => {
        callback(value, 'ok')
      },
      onCancel: () => {
        callback(value, 'cancel')
      },
    })
  }
}
