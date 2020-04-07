import pubSub, { NOTIFICATION_ACTIVATED } from '../pubSub'
import { Notification } from '../models'

const PublishNotificationActivated = async job => {
  const { notificationId } = job.attrs.data
  const notification = await Notification.findByPk(notificationId)

  if (notification.read) {
    throw new Error('Notification was read already')
  }

  if (notification.cancelled) {
    throw new Error('Notification was cancelled')
  }

  if (!notification.activateAt || notification.activateAt > new Date()) {
    throw new Error('Notification should not be activated')
  }

  pubSub.publish(NOTIFICATION_ACTIVATED, { notificationActivated: notification })
}

export default PublishNotificationActivated
