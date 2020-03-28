import Model, { Sequelize } from '../Model'

class Note extends Model {}

Note.init({
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  CustomerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  CallId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  PhoneNumberId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  body: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

export default Note
