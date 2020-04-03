import BusinessAction from '../BusinessAction'
import { Task } from '../models'

const TASK_TYPES = ['CALL', 'VISIT']

class CreateTask extends BusinessAction {
  validationConstraints = {
    customerId: { presence: true },
    triggererCallId: { presence: true },
    taskType: { presence: true, inclusion: TASK_TYPES }
  }

  async executePerform() {
    const { customerId, triggererCallId, taskType, dueDate } = this.params
    const transaction = this.transaction

    return await Task.create({
      taskType,
      dueDate,
      UserId: this.performer.id,
      CustomerId: customerId,
      TriggererCallId: triggererCallId,
      status: 'PENDING'
    }, { transaction })
  }
}

export default CreateTask
