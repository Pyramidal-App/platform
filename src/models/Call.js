import Model, { Sequelize } from '../Model'

class Call extends Model {}

Call.init({
  outcome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  PhoneNumberId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  CustomerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  dateTime: {
    type: Sequelize.DATE,
    allowNull: false
  }
})

export default Call
