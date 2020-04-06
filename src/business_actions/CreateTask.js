import addMinutes from 'date-fns/addMinutes'
import addDays from 'date-fns/addDays'

import BusinessAction from '../BusinessAction'
import { Task } from '../models'
import pubSub, { NOTIFICATION_ACTIVATED } from '../pubSub'

import CreateNotification from './CreateNotification'

const TASK_TYPES = ['CALL', 'VISIT']

class CreateTask extends BusinessAction {
  validationConstraints = {
    customerId: { presence: true },
    taskType: { presence: true, inclusion: TASK_TYPES }
  }

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
      Promise.all([
        addMinutes(task.dueDate, -30),
        addDays(task.dueDate, -1)
      ].map(async activateAt =>
        await new CreateNotification({
          activateAt,
          userId: this.performer.id,
          read: false,
          payload: task
        }, { transaction }).perform()
      ))
    }

    return task
  }
}

export default CreateTask
