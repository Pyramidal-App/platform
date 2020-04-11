import CreateTask from './business_actions/CreateTask'
import CancelTask from './business_actions/CancelTask'
import CompleteTask from './business_actions/CompleteTask'
import SearchTasks from './business_actions/SearchTasks'
  
/**
 * A simple namespace to encapsulate task related business actions.
 */
const Tasks = {
  create: CreateTask,
  cancel: CancelTask,
  complete: CompleteTask,
  search: SearchTasks
}

export default Tasks
