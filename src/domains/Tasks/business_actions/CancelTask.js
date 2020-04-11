import { Notification } from '$src/models'

import TaskStatusChangeAction from '../TaskStatusChangeAction'

/*
* Cancels a task.
* Takes care of cancelling related notifications.
*/
class CancelTask extends TaskStatusChangeAction {
  requiredTaskStatus = 'PENDING'
  newStatus = 'CANCELLED'
}

export default CancelTask
