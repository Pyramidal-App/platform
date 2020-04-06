import Model, { Sequelize } from '../Model'

const TASK_TYPES = ['CALL', 'VISIT']
const TASK_STATUSES = ['COMPLETED', 'PENDING', 'CANCELLED', 'OVERDUE']

class Task extends Model {}

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
