import BusinessAction from '../BusinessAction'
import { Notification } from '../models'
import Agenda, { PUBLISH_NOTIFICATION_ACTIVATED } from '../Agenda'

class CreateNotification extends BusinessAction {
  async executePerform () {
    const { userId, activateAt, read, payload } = this.params

    const notification = await Notification.create({
      UserId: userId,
      activateAt,
      read,
      payload
    }, { transaction: this.transaction })

    const job = [
      PUBLISH_NOTIFICATION_ACTIVATED,
      { notificationId: notification.id }
    ]

    if (
      notification.activateAt &&
      notification.activateAt > new Date()
    ) {
      Agenda.schedule(notification.activateAt, ...job)
    } else {
      Agenda.now(...job)
    }

    return notification
  }
}

export default CreateNotification
