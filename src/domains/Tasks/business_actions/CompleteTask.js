import TaskStatusChangeAction from '../TaskStatusChangeAction'

/**
 * Marks a task as completed, performed by an end user.
 * Takes care onf cancelling related notifications.
 */
class CompleteTask extends TaskStatusChangeAction {
  requiredTaskStatus = 'PENDING'
  newStatus = 'COMPLETED'
}

export default CompleteTask
