import Model, { Sequelize } from '../Model'

const TASK_TYPES = ['CALL', 'VISIT']
const TASK_STATUSES = ['COMPLETED', 'PENDING', 'CANCELLED']

/**
 * A sequelize model representing tasks to be completed by the system users.
 * @extends Model
 */
class Task extends Model {}

/**
 * @nodoc
 */
Task.init({
  taskType: {
    type: Sequelize.STRING,
    allowNull: false,
    isIn: TASK_TYPES
  },
  dueDate: Sequelize.DATE,
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  CustomerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  TriggererCallId: Sequelize.INTEGER,
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    isIn: TASK_STATUSES
  }
})

export default Task
