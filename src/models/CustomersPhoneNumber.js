import Model, { Sequelize } from '../Model'

class CustomersPhoneNumber extends Model {}

CustomersPhoneNumber.init({
  CustomerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  PhoneNumberId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
})

export default CustomersPhoneNumber

