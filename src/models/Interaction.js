import Model, { Sequelize } from '../Model'

class Interaction extends Model {}

Interaction.init({
  outcome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  PhoneNumberId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  CustomerId: Sequelize.INTEGER,
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  dateTime: {
    type: Sequelize.DATE,
    allowNull: false
  }
})

export default Interaction
