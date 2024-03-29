import BusinessAction from '$src/BusinessAction'
import { Notification } from '$src/models'

class MarkNotificationsRead extends BusinessAction {
  async executePerform() {
    const { notificationIds } = this.params
    const transaction = this.transaction

    const notifications =
      await Notification.findAll({ where: { id: notificationIds }, transaction })

    await Notification.update(
      { read: true },
      { where: { id: notificationIds }, transaction }
    )

    return notifications
  }
}

export default MarkNotificationsRead
