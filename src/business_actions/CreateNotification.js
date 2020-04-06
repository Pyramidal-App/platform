import BusinessAction from '../BusinessAction'
import { Notification } from '../models'
import agenda from '../Agenda'

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
      'publish notification activated',
      { notificationId: notification.id }
    ]

    if (
      notification.activateAt &&
      notification.activateAt > new Date()
    ) {
      agenda.schedule(notification.activateAt, ...job)
    } else {
      agenda.now(...job)
    }

    return notification
  }
}

export default CreateNotification
