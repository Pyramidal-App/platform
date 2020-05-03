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
  CallId: Sequelize.INTEGER,
  PhoneNumberId: Sequelize.INTEGER,
  body: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

export default Note
