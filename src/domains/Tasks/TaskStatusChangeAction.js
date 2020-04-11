import BusinessAction from '$src/BusinessAction.js'
import { Task, Notification } from '$src/models'
import Notifications from '$src/domains/Notifications'
import NotImplementedError from '$src/NotImplementedError'

/**
 * @abstract
 *
 * Encapsulates common behavior for task related business actions
 * that operate over a single task.
 *
 * It will change the task status and cancel related notifications.
 */
class TaskStatusChangeAction extends BusinessAction {
  /**
   * Override to define the status that the task must be in for this action to be allowed
   * @type {string}
   */
  get allowedStatus() { throw new NotImplementedError() }

  /**
   * Override to define the new status assigned to this task.
   * @type {string}
   */
  get newStatus() { throw new NotImplementedError() }

  validationConstraints =  {
    taskId: { presence: { allowEmpty: false } }
  }

  async isAllowed() {
    const task = await this._getTask()
    return task.status === this.requiredTaskStatus && super.isAllowed()
  }

  async executePerform() {
    const task = await this._getTask()
    const transaction = this.transaction
    await task.update({ status: this.newStatus }, { transaction })
    await this._cancelRelatedNotifications()
    return task
  }

  // "Private"
  async _getTask() {
    if (!this.task) { this.task = Task.findByPk(this.params.taskId) }
    return await this.task
  }

  async _cancelRelatedNotifications() {
    const task = await this._getTask()
    const transaction = this.transaction

    const notifications =
      await Notification.findAll({ where: { 'payload.id': task.id }, transaction })

    await Promise.all(
      notifications.map(
        n => new Notifications.cancel(
          { notificationId: n.id },
          this.performer,
          { transaction }
        ).perform()
      )
    )
  }
}

export default TaskStatusChangeAction
