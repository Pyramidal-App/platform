import BusinessAction from '../BusinessAction'
import Agenda, { PUBLISH_NOTIFICATION_ACTIVATED } from '../Agenda'
import { Notification } from '../models'

class CancelNotification extends BusinessAction {
  validationConstraints =  {
    notificationId: { presence: { allowEmpty: false } }
  }

  async executePerform() {
    const { notificationId } = this.params
    const transaction = this.transaction
    const notification = await Notification.findByPk(notificationId, { transaction })
    await notification.update({ cancelled: true })
    await Agenda.cancel({ name: PUBLISH_NOTIFICATION_ACTIVATED, data: { notificationId } })
    return notification
  }
}

export default CancelNotification
