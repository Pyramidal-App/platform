import Model, { Sequelize } from '../Model'

class Customer extends Model {}

Customer.init({
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

export default Customer
