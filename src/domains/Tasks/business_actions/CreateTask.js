import addMinutes from 'date-fns/addMinutes'
import addDays from 'date-fns/addDays'

import BusinessAction from '$src/BusinessAction'
import Notifications from '$src/domains/Notifications'
import { Task } from '$src/models'
import pubSub, { NOTIFICATION_ACTIVATED } from '$src/pubSub'

const TASK_TYPES = ['CALL', 'VISIT']

/**
 * Creates a Task
 *
 * Creates 3 notifications schedulled to activate at: task.dueDate - 30 minutes, task.dueDate - 1 day and task.dueDate
 *
 * @constructor
 * @param {object} params
 * @extends BusinessAction
 */
class CreateTask extends BusinessAction {
  validationConstraints = {
    customerId: { presence: { allowEmpty: false } },
    taskType: { presence: true, inclusion: TASK_TYPES }
  }

  /**
   * @return {object}
   */
  async executePerform() {
    const { customerId, triggererCallId, taskType, dueDate } = this.params
    const transaction = this.transaction

    const task = await Task.create({
      taskType,
      dueDate,
      UserId: this.performer.id,
      CustomerId: customerId,
      TriggererCallId: triggererCallId,
      status: 'PENDING'
    }, { transaction })

    if (task.dueDate) {
      await Promise.all([
        addMinutes(task.dueDate, -30),
        addDays(task.dueDate, -1),
        task.dueDate
      ].map(async activateAt => {
        if (activateAt < new Date()) { return }

        await new Notifications.craete({
          activateAt,
          userId: this.performer.id,
          read: false,
          payload: task
        }, { transaction }).perform()
      }))
    }

    return task
  }
}

export default CreateTask
