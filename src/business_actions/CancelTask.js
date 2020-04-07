import BusinessAction from '../BusinessAction'
import { Task, Notification } from '../models'
import CancelNotification from './CancelNotification'

/*
* Cancels a task.
* Takes care of cancelling related notifications.
*/
class CancelTask extends BusinessAction {
  validationConstraints =  {
    taskId: { presence: { allowEmpty: false } }
  }

  async isAllowed() {
    const task = await this._getTask()
    return task.UserId === this.performer.id
  }

  async executePerform() {
    const task = await this._getTask()
    const transaction = this.transaction

    await task.update({ status: 'CANCELLED' }, { transaction })

    const notifications = await Notification.findAll({ where: { 'payload.id': task.id }, transaction })

    await Promise.all(
      notifications.map(
        n => new CancelNotification(
          { notificationId: n.id },
          this.performer,
          { transaction }
        ).perform()
      )
    )

    return task
  }

  // "Private"
  async _getTask() {
    if (!this.task) { this.task = await Task.findByPk(this.params.taskId) }
    return this.task
  }
}

export default CancelTask
