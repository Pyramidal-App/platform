import Model, { Sequelize } from '../Model'

class Notification extends Model {}

Notification.init({
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  activateAt: Sequelize.DATE,
  read: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  payload: {
    type: Sequelize.JSON,
    allowNull: false
  }
})

export default Notification
